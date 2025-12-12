import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { BackButton } from "../../components/Ui";
import { chatService, API_URL } from "../../services/chatService";
import { useAuth } from "../../contexts/AuthContext";

const sendIcon = require("../../assets/Icons/send.png");

interface Message {
  id: string;
  text?: string;
  image?: string;
  sender: "me" | "other";
  time: string;
}

  export default function ChatDetailScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const flatListRef = React.useRef<FlatList>(null);
  const threadId = params.id as string;

  // Get user info from params or use defaults
  const userName = (params.name as string) || "User";
  const userAvatar =
    (params.avatar as string) || "https://ui-avatars.com/api/?name=User";

  React.useEffect(() => {
    loadMessages();
    setupSocketListeners();

    return () => {
      // Clean up socket listeners
      chatService.off('message:new', handleNewMessage);
      if (threadId) {
        chatService.leaveThread(threadId);
      }
    };
  }, [threadId]);

  const setupSocketListeners = () => {
    if (threadId) {
      chatService.joinThread(threadId);
      chatService.on('message:new', handleNewMessage);
    }
  };

  const handleNewMessage = (data: any) => {
    if (data.threadId === threadId) {
      setMessages(prev => {
        // Check if message already exists
        if (prev.find(m => m._id === data.message._id)) return prev;
        return [...prev, data.message];
      });
      scrollToBottom();
    }
  };

  const loadMessages = async () => {
    if (!threadId) return;
    try {
      const fetchedMessages = await chatService.getMessages(threadId);
      // Sort messages by creation time
      const sortedMessages = fetchedMessages.sort(
        (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      setMessages(sortedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleSend = async () => {
    if (messageText.trim() && threadId) {
      try {
        const text = messageText.trim();
        setMessageText(""); // Clear input immediately
        
        const newMessage = await chatService.sendMessage(threadId, text);
        setMessages(prev => [...prev, newMessage]);
        scrollToBottom();
      } catch (error) {
        console.error('Error sending message:', error);
        Alert.alert('Error', 'Failed to send message');
      }
    }
  };

  const handleCamera = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        // Send image
        const newMessage = await chatService.sendImage(threadId, result.assets[0].uri);
        setMessages(prev => [...prev, newMessage]);
        scrollToBottom();
      }
    } catch (error) {
      console.error('Error picking/sending image:', error);
      Alert.alert('Error', 'Failed to send image');
    }
  };

  const renderMessage = ({ item }: { item: any }) => {
    // Determine if message is from current user
    const senderId = item.sender?.userId?._id || item.sender?.userId || item.sender;
    const currentUserId = user?.id || user?._id; 
    const isMe = senderId && currentUserId && senderId.toString() === currentUserId.toString();
    
    return (
      <View style={[styles.messageContainer, isMe ? styles.myMessageContainer : styles.otherMessageContainer]}>
        <Text style={styles.dateLabel}>
            {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
        </Text>
        <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.otherMessage]}>
           {item.type === 'text' && (
             <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.otherMessageText]}>
               {item.content?.text || item.text}
             </Text>
           )}
           {item.type === 'image' && (
             <Image 
                source={{ uri: item.content?.mediaUrl?.startsWith('http') ? item.content.mediaUrl : `${API_URL}${item.content?.mediaUrl}` }} 
                style={styles.messageImage} 
                resizeMode="cover"
             />
           )}
        </View>
      </View>
    );
  };

  // Quick replies data
  const quickReplies = [
    { id: '1', text: 'Lorem Ipsum' },
    { id: '2', text: 'Lorem Ipsum' },
    { id: '3', text: '👍' },
    { id: '4', text: 'OK' },
    { id: '5', text: '❤️' },
  ];

  const handleQuickReply = (text: string) => {
    // Send directly or populate input? Image suggests they are buttons.
    // Let's populate input for now or send directly? 
    // Usually these are one-tap sends. Let's make them populate input for flexibility,
    // or if they are "smart replies", they send immediately.
    // Given the "OK" and emoji, immediate send is often expected 
    // BUT "Lorem Ipsum" suggests placeholders. I'll make them populate input.
    setMessageText(text);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} color="#B1B1B8FF" />
        <View style={styles.headerCenter}>
          <Image source={{ uri: userAvatar }} style={styles.headerAvatar} />
          <Text style={styles.headerName}>{userName}</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id || item._id} // Handle backend _id or local id
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={scrollToBottom}
      />

      {/* Suggested Replies */}
      <View style={styles.quickRepliesContainer}>
        <FlatList
          horizontal
          data={quickReplies}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickRepliesList}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[
                styles.quickReplyChip,
                (item.text === "👍" || item.text === "❤️") ? styles.quickReplyEmoji : null
              ]}
              onPress={() => handleQuickReply(item.text)}
            >
              {item.text === "👍" ? (
                 <Text style={{fontSize: 18}}>👍</Text>
              ) : item.text === "❤️" ? (
                 <Ionicons name="heart" size={18} color="#FF0000" />
              ) : (
                <Text style={styles.quickReplyText}>{item.text}</Text>
              )}
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TouchableOpacity style={styles.cameraButton} onPress={handleCamera}>
            <Ionicons name="camera-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Message"
            placeholderTextColor="#A1A5C1"
            value={messageText}
            onChangeText={setMessageText}
            multiline
          />
          <TouchableOpacity 
            style={styles.sendButton} 
            onPress={handleSend}
            disabled={!messageText.trim()}
          >
            {/* Using Ionicons for send to match style slightly better if icon png is issue, but keeping image as per request */}
            <Image 
              source={sendIcon} 
              style={[
                styles.sendIcon, 
                !messageText.trim() && { tintColor: "#CCC" }
              ]} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 15,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginLeft: 10,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  headerName: {
    fontSize: 18,
    fontFamily: "Raleway-Bold",
    color: "#FF8C42",
  },
  headerRight: {
    width: 40,
  },
  messagesList: {
    padding: 20,
    paddingBottom: 10,
  },
  messageContainer: {
    marginBottom: 15,
  },
  myMessageContainer: {
    alignItems: "flex-end",
  },
  otherMessageContainer: {
    alignItems: "flex-start",
  },
  dateLabel: {
    fontSize: 12,
    fontFamily: "Raleway-Regular",
    color: "#A1A5C1",
    textAlign: "center",
    marginBottom: 10,
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  myMessage: {
    backgroundColor: "#FF8C42",
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    backgroundColor: "#F5F4F8",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    fontFamily: "Raleway-Regular",
    lineHeight: 20,
  },
  myMessageText: {
    color: "#FFFFFF",
  },
  otherMessageText: {
    color: "#252B5C",
  },
  imageBubble: {
    padding: 0,
    margin: -10,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 16,
  },
  reactionButton: {
    backgroundColor: "#FFE5D3",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  reactionButtonRound: {
    backgroundColor: "#FF8C42",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  reactionButtonHeart: {
    backgroundColor: "#FFFFFF",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  reactionText: {
    fontSize: 12,
    fontFamily: "Raleway-Medium",
    color: "#FFFFFF",
  },
  quickRepliesContainer: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  quickRepliesList: {
    paddingRight: 20,
  },
  quickReplyChip: {
    backgroundColor: "#FFC09F", // Light peach
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    minWidth: 40,
    alignItems:'center',
    justifyContent:'center'
  },
  quickReplyEmoji: {
    backgroundColor: "#F5F4F8", // Gray for emojis or white
  },
  quickReplyText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Raleway-Medium",
  },
  heartIcon: {
    fontSize: 20,
  },
  inputContainer: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingBottom: Platform.OS === "ios" ? 30 : 12,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F4F8",
    borderRadius: 25,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  cameraButton: {
    backgroundColor: "#FCB78E",
    borderRadius: 20,
    padding: 4,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Raleway-Regular",
    color: "#252B5C",
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    padding: 4,
    marginLeft: 8,
  },
  sendIcon: {
    width: 24,
    height: 24,
    tintColor: "#FF8C42",
  },
});
