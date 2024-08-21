package api

import (
	"log"
	"net/http"
	"strconv"
	"time"
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
	defer s.removeConnection(connectionId, userID)

	go s.handleMessages(conn, uint64(userID))

	// Broadcast the list of online users after a new connection is added
	s.broadcastOnlineUsers(userID)

	for {
		_, _, err := conn.ReadMessage()
		if err != nil {
			log.Println(err)
			break
		}
	}
	// Broadcast the list of online users after a connection is removed
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

type pingEvent struct {
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
		time.Sleep(1 * time.Second)
	}
}
