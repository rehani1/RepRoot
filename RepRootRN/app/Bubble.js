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
    marginVertical: 8,
    paddingHorizontal: 14
  },
  rowStart: { justifyContent: "flex-start" },
  rowEnd: { justifyContent: "flex-end" },
  bubble: {
    maxWidth: "80%",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 28,
    marginBottom: 2,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
  },
  userBubble: {
    backgroundColor: "#fff",
    borderBottomRightRadius: 12,
  },
  aiBubble: {
    backgroundColor: "purple",
    borderBottomLeftRadius: 12,
  },
  text: { fontSize: 17 },
  userText: { color: "#111" },
  aiText: { color: "#fff" }
});
