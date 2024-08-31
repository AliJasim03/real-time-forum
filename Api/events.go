package api

import (
	backend "forum/db"
	"log"
	"net/http"
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

	connectionId := s.eventManager.addConnection(conn, userID)

	// Send the list of online users to the new connection
	s.sendOnlineUsers(userID)

	s.LastMessage(conn)

	// inside it infinite loop to handle messages and keep connection alive
	s.handleMessages(conn, userID)

	// Broadcast the list of online users after a connection is removed
	log.Println("Broadcast the list of online users after connection removal.")
	s.removeConnection(connectionId)
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

func (s *server) sendOnlineUsers(userID int) {
	onlineUsersChan := backend.GetOnlineUsersAsync(s.db, userID)

	// Use the result when it's ready
	onlineUsers := <-onlineUsersChan

	for i := range onlineUsers {
		for _, socket := range s.eventManager.sockets {
			if socket.userId == onlineUsers[i].ID {
				onlineUsers[i].IsOnline = true
				break
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

	s.sendEventToUser(data, userID)
	s.sendEventToAll(newUser, userID)
}

func (s *server) sendOfflineUser(userID int) {
	data := map[string]interface{}{
		"type": "offlineUser",
		"user": userID,
	}
	s.sendEventToAll(data, userID)
}

func (s *server) sendEventToUser(data interface{}, userID int) {
	s.eventManager.lock.Lock()
	defer s.eventManager.lock.Unlock()

	for _, socket := range s.eventManager.sockets {
		if socket.connection != nil && !socket.closed.Load() && socket.userId == userID {
			err := socket.connection.WriteJSON(data)
			if err != nil {
				log.Printf("Error sending event to user %d: %v", userID, err)
			}
			break
		}
	}
}

// sent to all except the user
func (s *server) sendEventToAll(data interface{}, userID int) {
	s.eventManager.lock.Lock()
	defer s.eventManager.lock.Unlock()

	for connectionId, socket := range s.eventManager.sockets {
		if socket.connection != nil && !socket.closed.Load() && socket.userId != userID {
			err := socket.connection.WriteJSON(data)
			if err != nil {
				log.Printf("Error sending event to connection ID %d: %v", connectionId, err)
				socket.closed.Store(true)
			}
		}
	}
}

func (s *server) sendEvents(data interface{}) {
	s.eventManager.lock.Lock()
	defer s.eventManager.lock.Unlock()

	for _, socket := range s.eventManager.sockets {
		if socket.connection != nil && !socket.closed.Load() {
			socket.connection.WriteJSON(data)
		}
	}
}

// func (s *server) broadcastOnlineUsers(userID int) {
// 	onlineUsers := s.getOnlineUsers(userID)
// 	data := map[string]interface{}{
// 		"type":  "onlineUsers",
// 		"users": onlineUsers,
// 	}
// 	s.sendToAll(data)
// }

/*type pingEvent struct {
	EventType string `json:"type"` // ping
	Count     int    `json:"count"`
}

func (s *server) SendPings() {
	event := pingEvent{
		EventType: "ping",
		Count:     0,
	}

	for {
		s.sendEvents(event)

		event.Count++
		time.Sleep(10 * time.Second)
	}
}*/
