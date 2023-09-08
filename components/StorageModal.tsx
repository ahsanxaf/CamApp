import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, TextInput, ToastAndroid } from 'react-native';
import RNFS from 'react-native-fs';
import DocumentPickerComponent from './DocumentPickerComponent';
import { PERMISSIONS, request } from 'react-native-permissions';

interface StorageModalProps {
  visible: boolean;
  onClose: () => void;
  onSavePath: (path: string) => void; // Callback function to send the selected path back
}

const defaultDirecoty: string = RNFS.PicturesDirectoryPath;
console.info('defaultDirecoty: ', defaultDirecoty)

const StorageModal: React.FC<StorageModalProps> = ({ visible, onClose, onSavePath }) => {

  const [selectedPath, setSelectedPath] = useState('');
  const [decoded, setDecoded] = useState('');
  const [useDefaultDirectory, setUseDefaultDirectory] = useState(true);
  const [showInputText, setShowInputText] = useState(false);
  const [isMounted, setIsMounted] = useState(false);


  useEffect(() => {
    if (isMounted) {
      setUseDefaultDirectory(true);
    } else {
      setIsMounted(true);
    }
  }, [isMounted]);

  const handleDirectorySelected =  (uri: string) => {
    console.info('Selected URI: ', uri)
    try {
      const decodedPath = decodeURIComponent(uri.replace(/\%3A/g, '/').replace(/\%2F/g, '/'));
      setDecoded(decodedPath);
      console.info('Decoded URI: ', decodedPath)
      setSelectedPath(decodedPath);
      console.log('Selected path: ', selectedPath)
    }catch (error) {
      console.error('Error decoding path:', error);
    }
  };

  const handleSavePress = () => {
    if (useDefaultDirectory) {
      onSavePath(defaultDirecoty); 
      setShowInputText(false); 
    } else {
      onSavePath(selectedPath);
      setShowInputText(true); // Show the input text for Choose Path
    }
    onClose();
    setSelectedPath('');
    ToastAndroid.showWithGravity('Path Updated', ToastAndroid.SHORT, ToastAndroid.BOTTOM);
  };
  const handleCancelPress = () => {
    onClose();
    setSelectedPath('');
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={{justifyContent: 'center', alignItems: 'center'}}>
            <Text style = {{color: 'yellow', marginBottom: 10, textTransform: 'uppercase'}}>Choose Path to save pictures</Text>
          </View>

          <View style={styles.radioContainer}>
            <TouchableOpacity
              onPress={() => {
                setUseDefaultDirectory(true);
                setShowInputText(false); 
            }}
              style={[styles.radioButton, useDefaultDirectory && styles.selectedRadioButton]}
            >
              <Text style={{marginLeft: 5, color: 'white'}}>Default Directory</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setUseDefaultDirectory(false);
                setShowInputText(true);
              }}
              style={[styles.radioButton, !useDefaultDirectory && styles.selectedRadioButton]}
            >
              <Text style={{marginLeft: 5, color: 'white'}}>Choose Path</Text>
            </TouchableOpacity>
          </View>

                    
          {!useDefaultDirectory && (
            <DocumentPickerComponent onDirectorySelected={handleDirectorySelected} />
          )}

          {selectedPath !== '' && showInputText && (
            <TextInput
              style={styles.pathInput}
              placeholder="Selected Path"
              value={decoded}
              editable={true}
            />
          )}
          <View style = {styles.saveCloseButtons}>
            <TouchableOpacity onPress={handleCancelPress}>
              <Text style = {{color: 'white', backgroundColor: 'red', padding: 3}}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSavePress}>
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
  },
  pathInput: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    color: 'yellow'
  },
  chooseAlbumButtonContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  chooseAlbumButton: {
    backgroundColor: 'pink',
    alignItems: 'center',
    padding: 10,
  },
  buttonText: {
    color: 'black',
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  selectedRadioButton: {
    backgroundColor: 'blue',
    borderRadius: 5,
    padding: 4,
  },
  radioContainer: {
    marginVertical: 10,
  },
});

export default StorageModal;


