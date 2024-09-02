// Import everything from the individual template files
import * as Index from './index.js';
import * as Login from './login.js';
import * as postDetails from './postDetails.js';
import * as Register from './register.js';
import * as createPost from './createPost.js';
import * as chat from './chat.js';
import * as userList from './user-list.js';
// Import other page modules similarly

// Re-export everything
export {
    Index,
    Login,
    Register,
    createPost,
    postDetails,
    chat,
    userList
};
