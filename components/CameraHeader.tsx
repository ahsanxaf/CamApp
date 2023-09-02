import React from "react";
import {View, TouchableOpacity, StyleSheet, Image, Text} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome';

interface CameraHeaderProps{
    onPressSettings: () => void;
    onPressFlashToggle: () => void;
    flashMode: "auto" | "on" | "off" | "torch";
}

const CameraHeader: React.FC<CameraHeaderProps> = ({onPressSettings, onPressFlashToggle, flashMode}) => {
    return(
        <View style={styles.header}>
            <View style={styles.flashOnButton}>
                <TouchableOpacity onPress={onPressFlashToggle}>
                    {/* <Icon name="settings-outline" size={24} color="white"/> */}
                    <Image source = {flashMode==="on" ? require('../assets/flashoff_icon.png') : require('../assets/flashon_icon.png')}/>
                </TouchableOpacity>
            </View> 
            <View style={styles.settingsButton}>
                <TouchableOpacity onPress={onPressSettings}>
                    {/* <Icon name="settings-outline" size={24} color="white"/> */}
                    <Image source={require('./img/setting_icon.png')}/>
                </TouchableOpacity>
            </View>  
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        padding: 7,
        height: '7%',
        backgroundColor: 'black',
        opacity: 0.5,
        // elevation: 4,
        // shadowColor: '#000',
        justifyContent: 'space-between',
        alignItems: 'center',
        top: 0,
        // left: 0,
        // right: 0,
        // shadowOffset: {
        //     width: 0,
        //     height: 2,
        // },
        // shadowOpacity: 0.25,
        // shadowRadius: 3.84,
        // position: "relative"
    },
    flex: {
        flex: 1,
    },
    settingsButton: {
        height: '30%',
        width: '7%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white'

    },
    flashOnButton: {
        height: '30%',
        width: '7%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white'
    }
});

export default CameraHeader;