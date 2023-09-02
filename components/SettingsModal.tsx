import React, { useState } from "react";
import {View, TouchableOpacity, Text, StyleSheet, Modal, Dimensions, useWindowDimensions} from 'react-native';
import {RNCameraProps} from 'react-native-camera'
import Icon from 'react-native-vector-icons/FontAwesome';
import QualityPreviewFrame from "./QualityPreviewFrame";
import {useNavigation, RouteProp} from '@react-navigation/native';
import {RootStackParamList} from '../navigations/AppNavigator'
import { StackNavigationProp } from "@react-navigation/stack";
import NamingSchemeScreen from "./NamingSchemeScreen";
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import StorageModal from "./StorageModal";
import QualityModal from "./QualityModal";
import { CameraQuality } from "../types/Types";

const stack = createStackNavigator()
interface SettingsModalProps{
    visible: boolean;
    selectedQuality: CameraQuality
    onClose: () => void;
    onQualitySelect: (selectedQuality: CameraQuality) => void;
    onSavePath: (path: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
    visible,
    selectedQuality,
    onClose,
    onQualitySelect,
    onSavePath
}) => {

    const [showQualityOptions, setShowQualityOptions] = useState(false);
    const [showNamingScheme, setShowNamingScheme] = useState(false);
    const [showStorageModal, setShowStorageModal] = useState(false);
    const [showQualityModal, setShowQualityModal] = useState(false);


    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const handleQualityButtonPress = () => {
        onClose();
        // setShowQualityOptions(true);
        setShowQualityModal(true);
        
    };

    const handleNamingSchemeButtonPress = () => {
        onClose();
        // setShowNamingScheme(true);
        navigation.navigate('NamingSchemeScreen');
    };

    const handleStorageButtonPress = () => {
        onClose();
        setShowStorageModal(true);
    }

    const { width: windowWidth, height: windowHeight } = useWindowDimensions();
    const modalContentWidth = windowWidth/2;
    const modalContentHeight = windowHeight * 0.5;

    const handleOverlayPress = () => {
        onClose();
    }
    
    return(
        <View>
            <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
                <TouchableOpacity style={{flex: 1}} onPress={handleOverlayPress} activeOpacity={1}>
                    <View style={[Styles.modalContainer, {height: modalContentHeight}]}>
                        <TouchableOpacity style={Styles.qualityButton} onPress={handleQualityButtonPress}>
                            <Text style={Styles.qualityButtonText}>Quality Options</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={Styles.modalButtonDesign} onPress={handleNamingSchemeButtonPress}>
                            <Text style={Styles.modalButtonTextDesign}>Naming Scheme</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={Styles.modalButtonDesign} onPress={handleStorageButtonPress}>
                            <Text style={Styles.modalButtonTextDesign}>Storage</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={Styles.modalButtonDesign}>
                            <Text style={Styles.modalButtonTextDesign}>Water Mark</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={Styles.modalButtonDesign}>
                            <Text style={Styles.modalButtonTextDesign}>Sound</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={Styles.modalButtonDesign}>
                            <Text style={Styles.modalButtonTextDesign}>Location</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={Styles.modalButtonDesign}>
                            <Text style={Styles.modalButtonTextDesign}>Framing Lines</Text>
                        </TouchableOpacity>
                        
                    </View>
                </TouchableOpacity>
            </Modal>
            {/* <QualityPreviewFrame
                visible={showQualityOptions}
                selectedQuality={selectedQuality}
                onClose={() => setShowQualityOptions(false)}
                onQualitySelect={onQualitySelect}/> */}
            <QualityModal visible={showQualityModal} onClose={() => setShowQualityModal(false)} onSelectQuality={onQualitySelect} SelectedQuality={selectedQuality} />

            <View style={{flex:1}}>
                <StorageModal 
                    visible={showStorageModal} 
                    onClose={() => setShowStorageModal(false)}
                    onSavePath={onSavePath} />
            </View>
        </View>
    );
};

const Styles = StyleSheet.create({
    modalButtonDesign: {
        justifyContent: 'flex-start',
        alignContent: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        marginTop: 20,
        borderRadius: 20
    },
    modalButtonTextDesign:{
        fontSize: 18,
        color: 'yellow',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalContainer: {
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        padding: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        height: '50%',
        marginTop: 55,
        },
    qualityButton: {
        alignItems: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderRadius: 20,
        justifyContent:'flex-start'
    },
    qualityButtonText: {
        fontSize: 18,
        color: 'yellow',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalContent: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 8,
        padding: 16,
    },
    settingModalParentView: {

    },
});

export default SettingsModal;
