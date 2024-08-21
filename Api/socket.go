package api

import (
    "encoding/json"
    // "fmt"
    "log"
    "strconv"
    "sync"
    "sync/atomic"

    "github.com/gorilla/websocket"
    backend "forum/db"
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

func makeSocketManager() *socketsManager {
    return &socketsManager{
        socketCounter: atomic.Uint64{},
        sockets:       make(map[uint64]userSocket),
    }
}

func (s *server) handleMessages(conn *websocket.Conn, userID uint64) {
    for {
        _, message, err := conn.ReadMessage()
        if err != nil {
            log.Printf("Error reading message: %v", err)
            break
        }

        var chatMessage struct {
            Type    string `json:"type"`
            To      string `json:"to"`
            Message string `json:"message"`
        }
        if err := json.Unmarshal(message, &chatMessage); err != nil {
            log.Printf("Error unmarshaling message: %v", err)
            continue
        }

        toUserID, err := strconv.Atoi(chatMessage.To)
        if err != nil {
            log.Printf("Error converting 'to' to integer: %v", err)
            continue
        }

        err = backend.SaveMessage(s.db, chatMessage.Message, toUserID, int(userID))
        if err != nil {
            log.Printf("Error saving message: %v", err)
            continue
        }

        log.Println("Message handled successfully")

        // TODO: Implement message forwarding
        // s.forwardMessage(chatMessage)
    }
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

func (s *server) removeConnection(connectionId uint64, userID int) {
    e := s.eventManager
    e.lock.Lock()
    defer e.lock.Unlock()

    if socket, exists := e.sockets[connectionId]; exists {
        socket.closed.Store(true)
        delete(e.sockets, connectionId)
        log.Printf("Connection ID %d removed for user %s", connectionId, socket.username)
    } else {
        log.Printf("Attempted to remove non-existent connection ID %d", connectionId)
    }
}

func (s *server) getOnlineUsers(userID int) []User {
    s.eventManager.lock.Lock()
    defer s.eventManager.lock.Unlock()

    rows, err := s.db.Query("SELECT username, id FROM users WHERE id != ? ORDER BY id", userID)
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
