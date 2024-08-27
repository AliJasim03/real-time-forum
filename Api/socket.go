package api

import (
	"encoding/json"
	// "fmt"
	"log"
	"strconv"
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
	username   string
	closed     *atomic.Bool
}

type User struct {
	Username string
	ID       int
	IsOnline bool
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

type ChatMessage struct {
	Type    string `json:"type"`
	To      string `json:"to"`
	Message string `json:"message"`
}

type messageSent struct {
	Type    string `json:"type"`
	From    string `json:"from"`
	Message string `json:"message"`
}

func makeSocketManager() *socketsManager {
	return &socketsManager{
		socketCounter: atomic.Uint64{},
		sockets:       make(map[uint64]userSocket),
	}
}

func (s *server) handleMessages(conn *websocket.Conn, userID int, connectionId uint64) {
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

		toUserID, err := strconv.Atoi(chatMessage.To)
		if err != nil {
			log.Printf("Error converting 'to' to integer: %v", err)
			continue
		}

		err = backend.SaveMessage(s.db, chatMessage.Message, toUserID, userID)
		if err != nil {
			log.Printf("Error saving message: %v", err)
			continue
		}

		log.Println("Message saved successfully")

		s.forwardMessage(chatMessage, userID)
		log.Println("Message forwarded, ready for the next message.")
	}

	log.Println("Connection closed or error occurred, exiting message handling loop.")
}

func (e *socketsManager) addConnection(conn *websocket.Conn, username string) uint64 {
	connectionId := e.socketCounter.Add(1)

	e.lock.Lock()
	defer e.lock.Unlock()

	e.sockets[connectionId] = userSocket{
		connection: conn,
		username:   username,
		closed:     &atomic.Bool{},
	}

	// Send the user ID to the client
	userID, _ := strconv.Atoi(username)
	initialMessage := map[string]interface{}{
		"type":   "initialConnection",
		"userID": userID,
	}
	conn.WriteJSON(initialMessage)

	log.Printf("User %s connected with connection ID %d", username, connectionId)
	return connectionId
}

func (e *socketsManager) removeConnectionByUsername(username string) {
	e.lock.Lock()
	defer e.lock.Unlock()

	for connectionId, socket := range e.sockets {
		if socket.username == username && !socket.closed.Load() {
			socket.closed.Store(true)
			delete(e.sockets, connectionId)
			log.Printf("Connection ID %d removed for user %s", connectionId, username)
			return
		}
	}
	log.Printf("No active connection found for user %s", username)
}

func (s *server) removeConnection(connectionId uint64) {
	e := s.eventManager
	e.lock.Lock()
	defer e.lock.Unlock()

	if socket, exists := e.sockets[connectionId]; exists && !socket.closed.Load() {
		socket.closed.Store(true)
		delete(e.sockets, connectionId)
		log.Printf("Connection ID %d removed for user %s", connectionId, socket.username)
		if err := socket.connection.Close(); err != nil {
			log.Printf("Error closing WebSocket connection: %v", err)
		}
	} else {
		log.Printf("Attempted to remove non-existent or already closed connection ID %d", connectionId)
	}
}

func (s *server) getOnlineUsers() []User {
	s.eventManager.lock.Lock()
	defer s.eventManager.lock.Unlock()

	rows, err := s.db.Query("SELECT username, id FROM users ORDER BY id")
	if err != nil {
		log.Printf("Error querying users: %v", err)
		return nil
	}
	defer rows.Close()

	var users []User
	for rows.Next() {
		var user User
		if err := rows.Scan(&user.Username, &user.ID); err != nil {
			log.Printf("Error scanning user: %v", err)
			continue
		}
		users = append(users, user)
	}

	for i := range users {
		for _, socket := range s.eventManager.sockets {
			if socket.username == strconv.Itoa(users[i].ID) {
				users[i].IsOnline = true
				break
			}
		}
	}
	return users
}
