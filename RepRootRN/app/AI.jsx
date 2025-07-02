
import React, { useCallback, useEffect, useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import KeyboardAvoid from './KeyboardAvoid';
import { chatRequest } from '../utils/gpt';
import { addUserMessage, getConversation, initConversation } from '../utils/conversation';
import { FlatList } from 'react-native-gesture-handler';
import Bubble from './Bubble';

const AIScreen = () => {

    const [message, setMessage] = useState("");
    const [conversation, setConversation] = useState([]);

    useEffect(() => {
        initConversation();
        setConversation([...getConversation()]);
  }, []);

  const sendMessage = useCallback(async () => {
    const text = message.trim();
    if (!text) return;


    addUserMessage(text);
    setMessage("");
    setConversation([...getConversation()]);

    
    try {
      await chatRequest(text);           
    } catch (err) {
      console.error("AI error:", err);
    }

    
    setConversation([...getConversation()]);
  }, [message]);
    return (
        <KeyboardAvoid>
            <View style={styles.container}>
                <View style={styles.card}>
                    <View style={styles.messagesContainer}>
                        <FlatList
                        data = {conversation}
                        renderItem={(itemData) => {
                            const conversationItem = itemData.item;
                            const { role, content } = conversationItem;

                            if (role === 'system') return null;
                            return <Bubble 
                                text={content}
                                type={role}
                            />
                        }}  
                        />
                    </View>
                    <View style={styles.textInput}>
                        <TextInput
                        style={styles.text}
                        placeholder="Type a message..."
                        placeholderTextColor="#bbb"
                        onChangeText={(text) => setMessage(text)}
                        value={message}
                        />
                        <TouchableOpacity style={styles.sendButton}
                        onPress={sendMessage}>
                            <Feather name="send" size={20} color="#232323" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </KeyboardAvoid>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#111',
    },
    card: {
        backgroundColor: '#232323',
        borderRadius: 28,
        margin: 18,
        flex: 1,
        shadowColor: '#000',
        shadowOpacity: 0.18,
        shadowRadius: 16,
        elevation: 8,
        paddingBottom: 8,
    },
    text: {
        flex: 1,
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    textInput: {
        flexDirection: 'row',
        backgroundColor: '#181818',
        padding: 14,
        borderRadius: 32,
        margin: 12,
        alignItems: 'center',
    },
    sendButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 22,
        backgroundColor: '#fff',
        marginLeft: 8,
        elevation: 2,
    },
    messagesContainer: {
        flex: 1,
    }
});

export default AIScreen;