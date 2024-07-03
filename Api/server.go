package api

import (
	"database/sql"
	"fmt"
	backend "forum/db"
	"log"
	"net/http"
	"os/exec"
	"runtime"
)

type server struct {
	mux *http.ServeMux
	db  *sql.DB
}

func New(db *sql.DB) *server {
	return &server{
		mux: http.NewServeMux(),
		db:  db,
	}
}

func (s *server) Init() {

	// Serve static files (CSS, JavaScript, etc.)
	s.mux.Handle("/front-end/static/", http.StripPrefix("/front-end/static/", http.FileServer(http.Dir("./front-end/static"))))

	// Define routes
	s.mux.HandleFunc("/", s.indexHandler)
	s.mux.HandleFunc("/login", s.loginPage)
	s.mux.HandleFunc("/loginAction", s.login)

	s.mux.HandleFunc("/register", s.registerPage)
	s.mux.HandleFunc("/registerAction", s.registration)
	
	s.mux.HandleFunc("/logout", s.logout)

	s.mux.HandleFunc("/createPost", s.createPostPage)
	s.mux.HandleFunc("/createPostAction", s.createPost)

	s.mux.HandleFunc("/likeOrDislikePost", s.likeDislikePost)

	fmt.Println("Server is running on http://localhost:8080/")
	//open in browser
	open("http://localhost:8080/")
	if err := http.ListenAndServe(":8080", s.mux); err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}

func (s *server) getPosts(user int, filter string) []backend.Post {
	var posts []backend.Post
	backend.GetPosts(s.db, user, &posts, filter)
	return posts
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
