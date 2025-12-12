import React, { useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { chatService } from "../../services/chatService";
import { useAuth } from "../../contexts/AuthContext";
import { ScreenWrapper } from "../../components/Ui";

export default function MessagesScreen() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [threads, setThreads] = React.useState<any[]>([]);
  const [refreshing, setRefreshing] = React.useState(false);
  const isInitialized = useRef(false);
  useAuth(); // Ensure auth context is available

  const loadThreads = async () => {
    try {
      const supportThread = await chatService.getOrCreateSupportThread();

      // Transform thread for display
      const formattedThreads = [supportThread].map((thread) => {
        return {
          id: thread._id,
          name: "Customer Support",
          message: thread.lastMessage?.content || "No messages yet",
          time: thread.lastMessage?.timestamp
            ? new Date(thread.lastMessage.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "",
          unread: thread.unreadCount > 0,
          avatar:
            "https://ui-avatars.com/api/?name=Support&background=FF8C42&color=fff",
          role: "support",
        };
      });

      setThreads(formattedThreads);
    } catch (error) {
      console.error("Error loading threads:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle new message received - update thread preview in real-time
  const handleNewMessage = useCallback((data: any) => {
    console.log("📨 Messages screen received new message:", data);
    setThreads((prevThreads) =>
      prevThreads.map((thread) => {
        if (thread.id === data.threadId) {
          const messageContent = data.message?.content?.text || data.message?.content || "New message";
          return {
            ...thread,
            message: messageContent,
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            unread: true,
          };
        }
        return thread;
      })
    );
  }, []);

  // Initialize chat service (only once)
  React.useEffect(() => {
    const initChat = async () => {
      try {
        await chatService.initialize();
        isInitialized.current = true;
        
        // Set up real-time listener
        chatService.on("message:new", handleNewMessage);
        
        await loadThreads();
      } catch (error) {
        console.error("Error initializing chat:", error);
        setLoading(false);
      }
    };

    initChat();

    // Don't disconnect on unmount - keep socket alive for other screens
    return () => {
      chatService.off("message:new", handleNewMessage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (isInitialized.current) {
        loadThreads();
      }
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadThreads();
  };

  const handleChatPress = (item: any) => {
    router.push({
      pathname: "/chat/[id]",
      params: {
        id: item.id,
        name: item.name,
        avatar: item.avatar,
      },
    });
  };

  const renderMessageItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.messageItem}
      onPress={() => handleChatPress(item)}
    >
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.messageContent}>
        <View style={styles.messageHeader}>
          <Text style={styles.senderName}>{item.name}</Text>
          <Text style={styles.messageTime}>{item.time}</Text>
        </View>
        <Text
          style={[styles.messageText, item.unread && styles.unreadMessage]}
          numberOfLines={1}
        >
          {item.message}
        </Text>
      </View>
      {item.unread && <View style={styles.unreadBadge} />}
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}> </Text>
        </View>

        {/* Messages List */}
        {loading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Loading...</Text>
          </View>
        ) : threads.length > 0 ? (
          <FlatList
            data={threads}
            renderItem={renderMessageItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Image
              source={require("../../assets/Icons/Message.png")}
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>
              Your messages will appear here
            </Text>
            <TouchableOpacity
              style={styles.startChatButton}
              onPress={loadThreads}
            >
              <Text style={styles.startChatText}>Start Support Chat</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Raleway-Bold",
    color: "#FF8C42",
  },
  listContainer: {
    padding: 20,
  },
  messageItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F4F8",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  senderName: {
    fontSize: 16,
    fontFamily: "Raleway-Bold",
    color: "#252B5C",
  },
  messageTime: {
    fontSize: 12,
    fontFamily: "Raleway-Regular",
    color: "#A1A5C1",
  },
  messageText: {
    fontSize: 14,
    fontFamily: "Raleway-Regular",
    color: "#53587A",
  },
  unreadMessage: {
    fontFamily: "Raleway-SemiBold",
    color: "#252B5C",
  },
  unreadBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FF6B35",
    marginLeft: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    tintColor: "#FF8C42",
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 20,
    fontFamily: "Raleway-Bold",
    color: "#252B5C",
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: "Raleway-Regular",
    color: "#A1A5C1",
    textAlign: "center",
  },
  startChatButton: {
    marginTop: 20,
    backgroundColor: "#FF8C42",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  startChatText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Raleway-Bold",
  },
});
