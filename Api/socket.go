package api

import (
	"fmt"
	"log"
	"strconv"
	"sync"
	"sync/atomic"

	"github.com/gorilla/websocket"
)

type socketsManager struct {
	sockets       map[uint64]userSockets
	socketCounter atomic.Uint64 // opened sockets count
	lock          sync.Mutex
}

type userSockets struct {
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

func makeSocketManager() *socketsManager {
	return &socketsManager{
		socketCounter: atomic.Uint64{},
		sockets:       make(map[uint64]userSockets),
	}
}

func (e *socketsManager) addConnection(conn *websocket.Conn, username string) uint64 {
	connectionId := e.socketCounter.Add(1)

	e.lock.Lock()
	defer e.lock.Unlock()

	e.sockets[connectionId] = userSockets{
		connection: conn,
		username:   username,
		closed:     &atomic.Bool{},
	}

	log.Printf("User %s connected with connection ID %d", username, connectionId)
	return connectionId
}

func (e *socketsManager) removeConnectionByUsername(username string) {
	e.lock.Lock()
	defer e.lock.Unlock()

	var connectionIdToRemove uint64
	found := false
	// Find the connection ID by username
	for connectionId, socket := range e.sockets {
		if socket.username == username && !socket.closed.Load() {
			connectionIdToRemove = connectionId
			found = true
			break
		}
	}
	if found {
		e.sockets[connectionIdToRemove].closed.Store(true)
		delete(e.sockets, connectionIdToRemove)
		log.Printf("Connection ID %d removed for user %s", connectionIdToRemove, username)
	} else {
		log.Printf("No active connection found for user %s", username)
	}
}

func (s *server) removeConnection(connectionId uint64, userID int) {
	e := s.eventManager
	e.lock.Lock()
	defer e.lock.Unlock()
	fmt.Print(userID)

	if socket, exists := e.sockets[connectionId]; exists {
		socket.closed.Store(true)
		delete(e.sockets, connectionId)
		// s.broadcastOnlineUsers(userID)
		log.Printf("Connection ID %d removed for user %s", connectionId, socket.username)
	} else {
		log.Printf("Attempted to remove non-existent connection ID %d", connectionId)
	}
}

// func (e *socketsManager) removeConnection(connectionId uint64) {
// 	isClose := e.sockets[connectionId].closed

// 	isClose.Store(true)

// 	e.lock.Lock()
// 	delete(e.sockets, connectionId)
// 	e.lock.Unlock()
// }

func (s *server) getOnlineUsers(userID int) []User {
	s.eventManager.lock.Lock()
	defer s.eventManager.lock.Unlock()

	// get all the usernames from the database

	rows, err := s.db.Query("SELECT username, id FROM users WHERE id != ? ORDER BY id", userID)
	if err != nil {
		fmt.Println(err)
	}
	defer rows.Close()
	var users []User
	for rows.Next() {
		var user User
		if err := rows.Scan(&user.Username, &user.ID); err != nil {
			fmt.Println(err)
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
