package api

import (
	"log"
	"net/http"
	"strconv"
	// "time"
)

func (s *server) indexHandler(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "front-end/index.html")
}

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

	username := strconv.Itoa(userID)

	connectionId := s.eventManager.addConnection(conn, username)

	// Broadcast the list of online users after a new connection is added
	s.broadcastOnlineUsers(userID)

	// inside it infinite loop to handle messages and keep connection alive
	s.handleMessages(conn, userID, connectionId)

	// Broadcast the list of online users after a connection is removed
	log.Println("Broadcast the list of online users after connection removal.")
	s.removeConnection(connectionId)
	s.broadcastOnlineUsers(userID)
}

func (s *server) forwardMessage(chatMessage ChatMessage, fromUserID int,
) {
	s.eventManager.lock.Lock()

	log.Printf("Attempting to forward message to user %s from user %d", chatMessage.To, fromUserID)

	var recipientFound bool
	for _, socket := range s.eventManager.sockets {
		log.Printf("Checking socket for user %s", socket.username)
		if socket.username == chatMessage.To {
			recipientFound = true

			message := messageSent{
				Type:    "chat",
				From:    strconv.Itoa(fromUserID),
				Message: chatMessage.Message,
			}

			err := socket.connection.WriteJSON(message)
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

func (s *server) broadcastOnlineUsers(userID int) {
	onlineUsers := s.getOnlineUsers(userID)
	data := map[string]interface{}{
		"type":  "onlineUsers",
		"users": onlineUsers,
	}
	s.sendEventToUser(data, userID)
}

func (s *server) sendEventToUser(data interface{}, userID int) {
	s.eventManager.lock.Lock()
	defer s.eventManager.lock.Unlock()

	for _, socket := range s.eventManager.sockets {
		if (socket.connection != nil && !socket.closed.Load()) && socket.username == strconv.Itoa(userID) {
			socket.connection.WriteJSON(data)
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

// func (s *server) sendToAll(data interface{}) {
// 	s.eventManager.lock.Lock()
// 	defer s.eventManager.lock.Unlock()

// 	for connectionId, socket := range s.eventManager.sockets {
// 		if socket.connection != nil && !socket.closed.Load() {
// 			err := socket.connection.WriteJSON(data)
// 			if err != nil {
// 				log.Printf("Error sending event to connection ID %d: %v", connectionId, err)
// 				socket.closed.Store(true)
// 			}
// 		}
// 	}
// }

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
