import React, { useCallback, useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import KeyboardAvoid from './KeyboardAvoid';

const AIScreen = () => {

    const [message, setMessage] = useState("");

    const sendMessage = useCallback(() => {
        setMessage("");
    }, [message]);
    return (
        <KeyboardAvoid>
            <View style={styles.container}>
                
                <View style={styles.messagesContainer}>

                </View>

            <View style={styles.textInput}>
                    <TextInput
                    style={styles.text}
                    placeholder="Type a message..."
                    onChangeText={(text) => setMessage(text)}
                    value={message}
                    />
                    <TouchableOpacity style={styles.sendButton}
                    onPress={sendMessage}>
                        <Feather name="send" size={18} color="white" />
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoid>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'lightgrey',
       
    },
    text: {
        flex: 1,
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    textInput: {
        flexDirection: 'row',
        backgroundColor: 'white',
        padding: 10
        },
        sendButton: {
            width: 35,
            height: 35,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 50,
            backgroundColor: 'purple',
        },
        messagesContainer: {
            flex: 1,
        
        }

    
});

export default AIScreen;