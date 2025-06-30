
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function Bubble({ text, type }) {
  const isUser = type === "user";

  return (
    <View

      style={[styles.row, isUser ? styles.rowEnd : styles.rowStart]}
    >
      <View 
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.aiBubble
        ]}
      >
        <Text
          style={[
            styles.text,
            isUser ? styles.userText : styles.aiText
          ]}
        >
          {text}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({

  row: {
    flexDirection: "row",
    marginVertical: 4,
    paddingHorizontal: 10
  },
  rowStart: { justifyContent: "flex-start" },
  rowEnd: { justifyContent: "flex-end" },

  bubble: {
    maxWidth: "80%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18
  },


  userBubble: {
    backgroundColor: "#7B1FA2",          
    borderBottomRightRadius: 4           
  },
  aiBubble: {
    backgroundColor: "#FFFFFF",        
    borderBottomLeftRadius: 4
  },


  text: { fontSize: 16 },
  userText: { color: "#FFFFFF" },
  aiText: { color: "#333333" }
});
