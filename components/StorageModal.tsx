import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import FilePickerComponent from './FilePickerComponent';

interface StorageModalProps {
  visible: boolean;
  onClose: () => void;
}

const handleSave = () => {
  
}

const StorageModal: React.FC<StorageModalProps> = ({ visible, onClose }) => {
  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style = {{color: 'yellow', marginBottom: 10, textTransform: 'uppercase'}}>Choose Path to save pictures</Text>
          <FilePickerComponent/>
          <View style = {styles.saveCloseButtons}>
            <TouchableOpacity onPress={onClose}>
              <Text style = {{color: 'white', backgroundColor: 'red', padding: 3}}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose}>
              <Text style = {{color: 'white', backgroundColor: 'green', padding: 3}}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  modalContent: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 20,
    borderRadius: 8,
  },
  closeButton: {
    marginTop: 10,
    alignSelf: 'flex-end',
  },
  saveButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  saveCloseButtons:{
    justifyContent: 'space-between',
    alignContent: 'center',
    flexDirection: 'row',
    marginTop: 15
  }
});

export default StorageModal;


