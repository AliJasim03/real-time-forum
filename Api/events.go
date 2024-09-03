package api

import (
	"github.com/gorilla/websocket"
	"log"
	"net/http"

	backend "forum/db"
	// "time"
)

// listen for event from the server
func (s *server) events(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	defer conn.Close()

	// Retrieve the username from cookies
	_, userID := s.authenticateCookie(r)

	if userID == -1 {
		return
	}

	s.eventManager.addConnection(conn, userID)

	// inside it infinite loop to handle messages and keep connection alive
	s.handleMessages(conn, userID)

	// Broadcast the list of online users after a connection is removed
	log.Println("Broadcast the list of online users after connection removal.")
	s.removeConnection(userID)
	s.sendOfflineUser(userID)
}

func (s *server) forwardMessage(chatMessage ChatMessage) {
	s.eventManager.lock.Lock()

	log.Printf("Attempting to forward message to user %s from user %d", chatMessage.To, chatMessage.From)

	var recipientFound bool
	for _, socket := range s.eventManager.sockets {
		log.Printf("Checking socket for user %s", socket.userId)
		if socket.userId == chatMessage.To {
			recipientFound = true
			err := socket.connection.WriteJSON(chatMessage)
			if err != nil {
				log.Printf("Error forwarding message to user %s: %v", chatMessage.To, err)
			} else {
				log.Printf("Message successfully forwarded to user %s: %s", chatMessage.To, chatMessage.Message)
			}
			break
		}
	}

	if !recipientFound {
		log.Printf("Recipient user %s not found or not connected", chatMessage.To)
	}

	s.eventManager.lock.Unlock()
}

func (s *server) sendOnlineUsers(conn *websocket.Conn, userID int) {
	onlineUsersChan := backend.GetOnlineUsersAsync(s.db, userID)

	// Use the result when it's ready
	onlineUsers := <-onlineUsersChan

	for i := range onlineUsers {
		for _, socket := range s.eventManager.sockets {
			if socket.userId == onlineUsers[i].ID {
				onlineUsers[i].IsOnline = true
			}
		}
	}

	data := map[string]interface{}{
		"type":  "onlineUsers",
		"users": onlineUsers,
	}

	newUser := map[string]interface{}{
		"type": "newOnlineUser",
		"user": userID,
	}

	s.sendEventToUser(conn, data)
	s.sendEventToAll(newUser, userID)
}

func (s *server) sendOfflineUser(userID int) {
	data := map[string]interface{}{
		"type": "offlineUser",
		"user": userID,
	}
	s.sendEventToAll(data, userID)
}

func (s *server) sendEventToUser(conn *websocket.Conn, data interface{}) {
	s.eventManager.lock.Lock()
	defer s.eventManager.lock.Unlock()

	if err := conn.WriteJSON(data); err != nil {
		log.Printf("Error sending last messages: %v", err)
	}

}

// sent to all except the user
func (s *server) sendEventToAll(data interface{}, userID int) {
	s.eventManager.lock.Lock()
	defer s.eventManager.lock.Unlock()

	for _, socket := range s.eventManager.sockets {
		if socket.connection != nil && !socket.closed.Load() && socket.userId != userID {
			err := socket.connection.WriteJSON(data)
			if err != nil {
				log.Printf("Error sending event to user ID %d: %v", socket.userId, err)
				socket.closed.Store(true)
			}
		}
	}
}
