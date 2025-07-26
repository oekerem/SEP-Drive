import React, { useEffect, useState } from "react";
import {useLocation, useParams} from "react-router-dom";
import {connectWebSocket, subscribe,unsubscribe, sendMessage} from '../websocket/WebSocketService';
import ChatService from "../services/ChatService";
import Box from '@mui/material/Box';
import Container from "@mui/material/Container";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';

function Chat() {

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const location = useLocation();
    const { username, role, partner } = location.state || {};
    const {driveOfferId} = useParams();
    const [error, setError] = useState("");
    const [editingID, setEditingID] = useState("");
    const [editInput, setEditInput] = useState("");



    const topic = `/topic/chat.${driveOfferId}`;
    const destination = `/app/chat.sendMessage`;




    useEffect(()=> {
        const getChat = async() => {
            try{
                const data = await ChatService.getMessages(driveOfferId);
                setMessages(data);
                console.log(data);
            } catch(error){
                setError("Fehler beim Abrufen des Chats: " + error.response?.data?.message);
            }
        };

        if(driveOfferId && role){
            getChat();
        }
    }, [driveOfferId,role]);


    useEffect(() => {
        const markOpened = async () => {
            try {
                if (driveOfferId && role ) {
                    await ChatService.markChatOpened(driveOfferId, role);
                }
            } catch (error) {
                console.error("Fehler beim Markieren des Chats als geöffnet:", error.response?.data?.message);
            }
        };

        markOpened();

    }, [messages, driveOfferId, role]);


    useEffect(()=> {

        connectWebSocket( () => {
            subscribe(topic, handleIncomingMessages)
        });

        return () => {
            unsubscribe(topic);
        }
    }, [driveOfferId,username,topic])




    const handleIncomingMessages = (message) =>{
        setMessages((msgHistory) =>
            [...msgHistory, message]
        )
    }

    const handleSend = () => {
        if(input.trim() === ""){
            return;
        }
        const message = {
            driveOfferId,
            senderUsername: username,
            content: input}

        sendMessage(destination, message);
        setInput("");
    };

    //Bearbeiten

    const handleEdit = (message) => {

        setEditingID(message.id);
        setEditInput(message.content);
    };

    const submitEdit = async (messageID) => {

        if(!editInput.trim()) {return}

        try {
            await ChatService.editMessage(messageID, username, editInput);
            setMessages((prev) =>
                prev.map((m) =>
                    m.id === messageID
                        ? {...m, content: editInput, edited: true}
                        : m
                )
            );
            cancelEdit();

        } catch (error) {
            alert("Bearbeiten fehlgeschlagen: " + error.response?.data?.message);

        }
    };

    const cancelEdit = () => {
        setEditingID("");
        setEditInput("");
    };


    // Löschen

    const handleDelete = async (messageId) => {

        try{
            await ChatService.deleteMessage(messageId,username);
            setMessages((msg) =>
                msg.filter((m) => m.id !== messageId));
        } catch(error){
            alert("Löschen fehlgeschlagen: " + error.response?.data?.message);
        }
    };



    if (error) { return <p>{error}</p>}


    return (


        <>

            <Container maxWidth={"md"} sx={{py:"34px"}}>

                <Box  sx={{ display: "flex", flexDirection:"column",alignItems:"center", gap:"20px", mb:"34px",}}>
                    <h2>Chat mit <Link to={`/profile/${partner}`}>{partner}</Link></h2>
                    <Box
                        sx={{
                            width: "100%",
                            p: 2,
                            borderRadius: 2,
                            boxShadow: 3,
                            bgcolor: "#f9f9f9",
                            maxHeight: "500px",
                            overflowY: "auto",
                        }}
                    >
                        {messages.map((message) => (
                            <Box
                                key={message.id}
                                sx={{
                                    mb: 2,
                                    p: 2,
                                    borderRadius: 1,
                                    bgcolor: "#ffffff",
                                    boxShadow: 1,
                                }}
                            >

                                <strong><Link to={`/profile/${message.senderUsername}`}>{message.senderUsername}</Link></strong>: {message.content}

                                {message.senderUsername === username &&  (
                                    editingID !== message.id
                                        ? (
                                            <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                                                <Button size="small" onClick={() => handleEdit(message)}>Bearbeiten</Button>
                                                <Button size="small" color="error" onClick={() => handleDelete(message.id)}>Löschen</Button>
                                            </Box>

                                        ) : (
                                            <>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    sx={{mt:1, mb:1}}
                                                    type ="text"
                                                    value = {editInput}
                                                    onChange = {(e) => setEditInput(e.target.value)}/>

                                                <Box sx={{ display: "flex", gap: 1 }}>
                                                    <Button variant="contained" size="small" onClick={() => submitEdit(message.id)}>Ändern</Button>
                                                    <Button variant="outlined" size="small" onClick={cancelEdit}>Abbrechen</Button>
                                                </Box>

                                            </>
                                        )
                                )}

                            </Box>
                        ))}
                    </Box>

                    <Box  sx={{ display: "flex",alignItems:"center", gap:"20px", width:"100%",}}>

                        <TextField
                            fullWidth
                            label={"Nachricht eingeben..."}
                            type ="text"
                            value = {input}
                            onChange = {(e) => setInput(e.target.value)}/>

                        <Button variant="contained" onClick={handleSend}> Senden </Button>


                    </Box>
                </Box>
            </Container>
        </>
    );
}

export default Chat
