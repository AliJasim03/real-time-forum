package api

import (
	"log"
	"net/http"
	"time"
)

func (s *server) indexHandler(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "front-end/templates/layout.html")
}

// listen for event from the server
func (s *server) events(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	defer conn.Close()

	connectionId := s.eventManager.addConnection(conn)
	defer s.eventManager.removeConnection(connectionId)

	for {
		_, _, err := conn.ReadMessage()
		if err != nil {
			log.Println(err)
			break
		}
		/*
			if err = conn.WriteMessage(messageType, message); err != nil {
				log.Println(err)
				break
			}
		*/
	}
}

func (s *server) sendEvents(data interface{}) {

	s.eventManager.lock.Lock()

	for _, socket := range s.eventManager.sockets {
		if socket.connection != nil && socket.closed.Load() == false {
			socket.connection.WriteJSON(data)
		}
	}

	s.eventManager.lock.Unlock()
}

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
