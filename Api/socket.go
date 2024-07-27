package api

import (
	"github.com/gorilla/websocket"
	"sync"
	"sync/atomic"
)

type socketsManager struct {
	sockets       map[uint64]userSockets
	socketCounter atomic.Uint64 // opened sockets count
	lock          sync.Mutex
}

type userSockets struct {
	connection *websocket.Conn
	closed     *atomic.Bool
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

func (e *socketsManager) addConnection(conn *websocket.Conn) uint64 {
	connectionId := e.socketCounter.Add(1)

	e.lock.Lock()
	e.sockets[connectionId] = userSockets{
		connection: conn,
		closed:     &atomic.Bool{},
	}
	e.lock.Unlock()

	return connectionId
}

func (e *socketsManager) removeConnection(connectionId uint64) {
	isClose := e.sockets[connectionId].closed

	isClose.Store(true)

	e.lock.Lock()
	delete(e.sockets, connectionId)
	e.lock.Unlock()
}
