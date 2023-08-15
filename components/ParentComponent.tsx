import React, { useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet, Modal, Dimensions, useWindowDimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import SettingsModal from "./SettingsModal";
import QualityPreviewFrame from "./QualityPreviewFrame";

type CameraQuality = 'low' | 'medium' | 'high';

const ParentComponent: React.FC = () => {
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [showQualityOptions, setShowQualityOptions] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState<CameraQuality>('medium');

  const handleQualityButtonPress = () => {
    setSettingsModalVisible(true);
  };

  return (
    <View style={{justifyContent:'center', alignItems: 'center'}}>
      <TouchableOpacity style={{justifyContent:'flex-start', alignItems: 'center'}} onPress={handleQualityButtonPress}>
        <Text>Open Settings</Text>
      </TouchableOpacity>

      <SettingsModal
        visible={settingsModalVisible}
        selectedQuality={selectedQuality}
        onClose={() => setSettingsModalVisible(false)}
        onQualitySelect={(quality: CameraQuality) => {
          setSelectedQuality(quality);
          setShowQualityOptions(true);
          setSettingsModalVisible(false);
        }}
      />

      {showQualityOptions && (
        <QualityPreviewFrame
          visible={true}
          selectedQuality={selectedQuality}
          onClose={() => setShowQualityOptions(false)}
          onQualitySelect={(quality: CameraQuality) => {
            setSelectedQuality(quality);
            setShowQualityOptions(false);
          }}
        />
      )}
    </View>
  );
};

export default ParentComponent;