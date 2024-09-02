package api

import (
	"encoding/json"
	// "fmt"
	"log"
	"sync"
	"sync/atomic"
	"time"

	backend "forum/db"
	"github.com/gorilla/websocket"
)

type socketsManager struct {
	sockets       map[int]userSocket
	socketCounter atomic.Uint64
	lock          sync.Mutex
}

type userSocket struct {
	connection   *websocket.Conn
	userId       int
	connectionId uint64
	closed       *atomic.Bool
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

type ChatType struct {
	Type string `json:"type"`
}

type ChatMessage struct {
	Type    string `json:"type"`
	From    int    `json:"from"`
	To      int    `json:"to"`
	Message string `json:"message"`
}

type ChatPayload struct {
	Type        string `json:"type"`
	SenderID    int    `json:"senderID"`
	RecipientID int    `json:"recipientID"`
}

type LoadMessages struct {
	Username  string    `json:"username"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
}

func makeSocketManager() *socketsManager {
	return &socketsManager{
		socketCounter: atomic.Uint64{},
		sockets:       make(map[int]userSocket),
	}
}

func (s *server) handleMessages(conn *websocket.Conn, userID int) {
	for {
		var chat ChatType
		log.Println("Waiting for message...")

		_, message, err := conn.ReadMessage()
		if err != nil {
			// General error logging
			log.Printf("Error reading WebSocket message: %v", err)
			break
		}
		log.Printf("Received message: %s", message)

		if err := json.Unmarshal(message, &chat); err != nil {
			log.Printf("Error unmarshaling message: %v", err)
			continue
		}

		log.Printf("Parsed message: %+v", chat)

		switch chat.Type {
		case "onlineUsers":
			s.sendOnlineUsers(conn, userID)
			break
		case "chatOpen":
			s.LastMessage(conn, userID)
			break
		case "chat":
			s.SendMessage(conn, userID)
			break
		default:
			log.Printf("Unknown message type: %s", chat.Type)
		}

	}

	log.Println("Connection closed or error occurred, exiting message handling loop.")
}

func (e *socketsManager) addConnection(conn *websocket.Conn, userId int) uint64 {
	connectionId := e.socketCounter.Add(1)

	e.lock.Lock()
	defer e.lock.Unlock()

	e.sockets[userId] = userSocket{
		connection:   conn,
		userId:       userId,
		connectionId: connectionId,
		closed:       &atomic.Bool{},
	}

	return connectionId
}

func (s *server) removeConnectionByUserId(userId int) {
	e := s.eventManager
	e.lock.Lock()
	defer e.lock.Unlock()

	for connectionId, socket := range e.sockets {
		if socket.userId == userId && !socket.closed.Load() {
			socket.closed.Store(true)
			delete(e.sockets, connectionId)
			log.Printf("Connection ID %d removed for user %s", connectionId, userId)
			return
		}
	}
	log.Printf("No active connection found for user %s", userId)
}

func (s *server) removeConnection(userId int) {
	e := s.eventManager
	e.lock.Lock()
	defer e.lock.Unlock()

	if socket, exists := e.sockets[userId]; exists && !socket.closed.Load() {
		socket.closed.Store(true)
		delete(e.sockets, userId)
		log.Printf("Connection ID %d removed for user %s", userId, socket.userId)
		if err := socket.connection.Close(); err != nil {
			log.Printf("Error closing WebSocket connection: %v", err)
		}
	} else {
		log.Printf("Attempted to remove non-existent or already closed user ID %d", userId)
	}
}

func (s *server) SendMessage(conn *websocket.Conn, userID int) {
	var chatMessage ChatMessage
	_, message, err := conn.ReadMessage()
	if err != nil {
		log.Printf("Error reading WebSocket message: %v", err)
		return
	}
	if err := json.Unmarshal(message, &chatMessage); err != nil {
		log.Printf("Error unmarshaling message: %v", err)
		return
	}
	//add user id to the message
	chatMessage.From = userID
	err = backend.SaveMessage(s.db, chatMessage.Message, chatMessage.To, userID)
	if err != nil {
		log.Printf("Error saving message: %v", err)
		return
	}
	log.Println("Message saved successfully")

	s.forwardMessage(chatMessage)
	log.Println("Message forwarded, ready for the next message.")
}

func (s *server) LastMessage(conn *websocket.Conn, userID int) {
	_, message, err := conn.ReadMessage()
	if err != nil {
		log.Printf("Error reading WebSocket message: %v", err)
		return
	}
	var load ChatPayload
	if err := json.Unmarshal(message, &load); err != nil {
		log.Printf("Error unmarshaling message: %v", err)
		return
	}
	load.SenderID = userID
	log.Printf("Sender: %d, Recipit: %d", load.SenderID, load.RecipientID)
	messages, err := backend.GetLastMessages(s.db, load.SenderID, load.RecipientID, 10)
	if err != nil {
		log.Printf("Error fetching last messages: %v", err)
		return
	}
	var convertedMessages []LoadMessages
	for _, msg := range messages {
		convertedMessages = append(convertedMessages, LoadMessages{
			Username:  msg.Username,
			Content:   msg.Content,
			CreatedAt: msg.CreatedAt,
		})
	}
	log.Println("All messages:", convertedMessages)

	data := map[string]interface{}{
		"type":     "oldMessages",
		"messages": convertedMessages,
	}

	if err := conn.WriteJSON(data); err != nil {
		log.Printf("Error sending last messages: %v", err)
	}
}
