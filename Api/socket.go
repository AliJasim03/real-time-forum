package api

import (
	"encoding/json"
	// "fmt"
	"log"
	"sync"
	"sync/atomic"

	backend "forum/db"

	"github.com/gorilla/websocket"
)

type socketsManager struct {
	sockets       map[uint64]userSocket
	socketCounter atomic.Uint64
	lock          sync.Mutex
}

type userSocket struct {
	connection *websocket.Conn
	userId     int
	closed     *atomic.Bool
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

type ChatMessage struct {
	Type    string `json:"type"`
	From    int    `json:"from"`
	To      int    `json:"to"`
	Message string `json:"message"`
}

/*type Load struct {
	Type    string `json:"type"`
	userID1 int    `json:"userID1"`
	userID2 int    `json:"userID2"`
	Content string `json:"message"`
}*/

func makeSocketManager() *socketsManager {
	return &socketsManager{
		socketCounter: atomic.Uint64{},
		sockets:       make(map[uint64]userSocket),
	}
}

/*func (s *server) LastMessage(conn *websocket.Conn) {
	_, message, err := conn.ReadMessage()
	if err != nil {
		log.Printf("Error reading WebSocket message: %v", err)
		return
	}

	var load Load
	if err := json.Unmarshal(message, &load); err != nil {
		log.Printf("Error unmarshaling message: %v", err)
		return
	}

	userID1 := load.userID1
	userID2 := load.userID2

	messages, err := backend.GetLastMessages(s.db, userID1, userID2, 10)
	if err != nil {
		log.Printf("Error fetching last messages: %v", err)
		return
	}

	response := LastMessagesResponse{
		Type:     "lastMessages",
		Message: messages,
	}

	if err := conn.WriteJSON(response); err != nil {
		log.Printf("Error sending last messages: %v", err)
	}
}
*/

func (s *server) handleMessages(conn *websocket.Conn, userID int) {
	for {
		var chatMessage ChatMessage
		log.Println("Waiting for message...")

		_, message, err := conn.ReadMessage()
		if err != nil {
			// General error logging
			log.Printf("Error reading WebSocket message: %v", err)
			break
		}

		log.Printf("Received message: %s", message)

		if err := json.Unmarshal(message, &chatMessage); err != nil {
			log.Printf("Error unmarshaling message: %v", err)
			continue
		}

		log.Printf("Parsed message: %+v", chatMessage)

		chatMessage.From = userID

		err = backend.SaveMessage(s.db, chatMessage.Message, chatMessage.To, userID)
		if err != nil {
			log.Printf("Error saving message: %v", err)
			continue
		}

		log.Println("Message saved successfully")

		s.forwardMessage(chatMessage)
		log.Println("Message forwarded, ready for the next message.")
	}

	log.Println("Connection closed or error occurred, exiting message handling loop.")
}

func (e *socketsManager) addConnection(conn *websocket.Conn, userId int) uint64 {
	connectionId := e.socketCounter.Add(1)

	e.lock.Lock()
	defer e.lock.Unlock()

	e.sockets[connectionId] = userSocket{
		connection: conn,
		userId:     userId,
		closed:     &atomic.Bool{},
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

func (s *server) removeConnection(connectionId uint64) {
	e := s.eventManager
	e.lock.Lock()
	defer e.lock.Unlock()

	if socket, exists := e.sockets[connectionId]; exists && !socket.closed.Load() {
		socket.closed.Store(true)
		delete(e.sockets, connectionId)
		log.Printf("Connection ID %d removed for user %s", connectionId, socket.userId)
		if err := socket.connection.Close(); err != nil {
			log.Printf("Error closing WebSocket connection: %v", err)
		}
	} else {
		log.Printf("Attempted to remove non-existent or already closed connection ID %d", connectionId)
	}
}
