import { io } from "socket.io-client";

const URL = import.meta.env.VITE_SOCKET_API_URL || "http://localhost:4600";
const socket = io(URL, {
    autoconnect: false,
});
// const socket = io(URL, {
//     autoconnect: false,
// });

export default socket;