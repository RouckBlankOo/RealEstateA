import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

const PrimaryButton = ({ title, onPress, style = {}, textStyle = {}, disabled = false }) => {
  return (
    <TouchableOpacity 
      style={[styles.button, disabled && styles.disabledButton, style]} 
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.buttonText, disabled && styles.disabledText, textStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#FF6B35',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#FF6B35',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  disabledText: {
    color: '#999',
  },
});

export default PrimaryButton;