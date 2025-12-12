import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Modal from "./Modal";

interface TimePickerModalProps {
  visible: boolean;
  title: string;
  selectedTime: string;
  timeSlots: string[];
  onTimeSelect: (time: string) => void;
  onClose: () => void;
}

const TimePickerModal: React.FC<TimePickerModalProps> = ({
  visible,
  title,
  selectedTime,
  timeSlots,
  onTimeSelect,
  onClose,
}) => {
  return (
    <Modal visible={visible} title={title} onClose={onClose}>
      <View style={styles.container}>
        {timeSlots.map((time) => (
          <TouchableOpacity
            key={time}
            style={[
              styles.timeOption,
              selectedTime === time && styles.selectedTimeOption,
            ]}
            onPress={() => onTimeSelect(time)}
          >
            <Text
              style={[
                styles.timeText,
                selectedTime === time && styles.selectedTimeText,
              ]}
            >
              {time}
            </Text>
            {selectedTime === time && (
              <Ionicons name="checkmark" size={20} color="#FF8C42" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  timeOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  selectedTimeOption: {
    backgroundColor: "#FFF5F0",
    borderColor: "#FF8C42",
    borderWidth: 1,
    borderRadius: 8,
    marginVertical: 2,
    paddingHorizontal: 15,
  },
  timeText: {
    fontSize: 14,
    color: "#333333",
    fontFamily: "comfortaa-400Regular",
  },
  selectedTimeText: {
    color: "#FF8C42",
    fontWeight: "bold",
    fontFamily: "comfortaa-500Medium",
  },
});

export default TimePickerModal;
