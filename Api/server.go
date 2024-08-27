package api

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os/exec"
	"runtime"
)

type server struct {
	mux          *http.ServeMux
	db           *sql.DB
	eventManager *socketsManager
}

func New(db *sql.DB) *server {
	return &server{
		mux:          http.NewServeMux(),
		db:           db,
		eventManager: makeSocketManager(),
	}
}

func (s *server) Init() {
	// go s.SendPings() // for testing websockets
	// Serve static files (CSS, JavaScript, etc.)
	s.mux.Handle("/front-end/static/", http.StripPrefix("/front-end/static/", http.FileServer(http.Dir("./front-end/static"))))

	// Define routes
	s.mux.HandleFunc("/", s.indexHandler)

	s.mux.HandleFunc("/events", s.events)

	// API routes
	s.mux.HandleFunc("/api/loginAction", s.login)
	s.mux.HandleFunc("/api/registerAction", s.registration)
	s.mux.HandleFunc("/api/logout", s.logout)
	s.mux.HandleFunc("/api/checkAuth", s.checkAuth)
	s.mux.HandleFunc("/api/getMessges", s.handleGetLastMessages)
	s.mux.HandleFunc("/api/categories", s.getCategories)
	s.mux.HandleFunc("/api/posts", s.getPosts)

	s.mux.HandleFunc("/api/post", s.getPost)

	s.mux.HandleFunc("/api/myPosts", s.myPosts)
	s.mux.HandleFunc("/api/likedPosts", s.likedPosts)

	s.mux.HandleFunc("/api/createPostAction", s.createPost)
	s.mux.HandleFunc("/api/likeOrDislikePost", s.likeDislikePost)

	s.mux.HandleFunc("/api/createCommentAction", s.createComment)
	s.mux.HandleFunc("/api/likeOrDislikeComment", s.likeDislikeComment)

	s.mux.HandleFunc("/api/getPostLikesAndDislikesCount", s.getPostLikesAndDislikesCount)
	s.mux.HandleFunc("/api/getCommentLikeDislikeCount", s.getCommentLikesAndDislikesCount)

	fmt.Println("Server is running on http://localhost:8080/")
	// open in browser
	open("http://localhost:8080/")
	if err := http.ListenAndServe(":8080", s.mux); err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}

func open(url string) error {
	var cmd string
	var args []string

	switch runtime.GOOS {
	case "windows":
		cmd = "cmd"
		args = []string{"/c", "start"}
	case "darwin":
		cmd = "open"
	default: // "linux", "freebsd", "openbsd", "netbsd"
		cmd = "xdg-open"
	}
	args = append(args, url)

	return exec.Command(cmd, args...).Start()
}
