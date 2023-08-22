import React, {useState} from "react";
import {
View, 
Text,
TextInput,
TouchableOpacity,
StyleSheet,
ToastAndroid,
} from 'react-native';
import CheckBox from "@react-native-community/checkbox";
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import { CameraNamingScheme } from "../types/NamingSchemeTypes";
import { RootStackParamList } from "../navigations/AppNavigator";


type NamingSchemeScreenRouteProp = RouteProp<RootStackParamList, 'NamingSchemeScreen'>;
const NamingSchemeScreen: React.FC<{route: NamingSchemeScreenRouteProp}> = ({route}) => {
    const [useDateTime, setUseDateTime] = useState(true);
    const [useSequence, setUseSequence] = useState(false);
    const [sequence, setSequence] = useState('');
    const [prefix, setPrefix] = useState('');

    const navigation = useNavigation();
    // const route = useRoute();

    const handleSave = () => {
        let namingScheme: CameraNamingScheme;
        if(useDateTime){
            namingScheme = {
                type: 'datetime',
                prefix
            }
        }
        else if(useSequence){
            namingScheme = {
                type: 'sequence',
                prefix,
                sequence
            };

            const nextSequence = String(Number(sequence) + 1);
            setSequence(nextSequence);
        }
        else if(useDateTime && useSequence){
            namingScheme = {
                type: 'datetime & sequence',
                prefix,
                sequence
            }
        }

        navigation.goBack();
        ToastAndroid.showWithGravity('Naming Scheme has been updated', ToastAndroid.SHORT, ToastAndroid.TOP)

        // const updatedParams = route.params
        // ? {
        //       ...route.params,
        //       setNamingScheme: namingScheme,
        //   }
        // : undefined;
        // navigation.setParams({
        //     ...route.params
        //     setNamingScheme: namingScheme
        // });
    };
    return(
        <View style = {styles.container}>
            <View style = {styles.headingContainer}>
                <Text style = {styles.textHeader}>Select Naming Scheme</Text>
            </View>
            <View style={styles.checkBoxContainer}>
                <CheckBox
                value={useDateTime}
                onValueChange={() => {
                    setUseDateTime(!useDateTime);
                    // setUseSequence(false);
                }}
                tintColors={{ true: '#34ebd8', false: 'grey' }}/>

                <Text style = {styles.checkboxLabel}>Use Current Date and Time</Text>
            </View>
            <View style = {styles.checkBoxContainer}>
                <CheckBox
                value={useSequence}
                onValueChange={() => {
                    setUseSequence(!useSequence);
                    // setUseDateTime(false);
                }}
                tintColors={{ true: '#34ebd8', false: 'grey' }}
                />

                <Text style = {styles.checkboxLabel}>Use Sequence</Text>
            </View>
            {useSequence && (
                <TextInput
                    style={styles.input}
                    placeholder="Enter Sequence"
                    value={sequence}
                    onChangeText={setSequence}
                />
            )}
            <TextInput
                style={styles.input}
                placeholder="Enter Prefix"
                value={prefix}
                onChangeText={setPrefix}
            />

            <TouchableOpacity style = {styles.saveButton} onPress={handleSave}>
                <Text style = {{color: 'white'}}>Save</Text>
            </TouchableOpacity>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        // backgroundColor: 'rgba(0, 0, 0, .3)',
    },

    input: {
        height: 40,
        borderColor: 'grey',
        borderWidth: 1,
        marginBottom: 16,
        paddingHorizontal: 8,
        color: 'black',

    },
    saveButton: {
        backgroundColor: 'blue',
        padding: 10,
        alignItems: 'center',
        borderRadius: 8,
    },

    checkboxLabel: {
        color: 'black',
        fontSize: 20,
    },

    headingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
    },

    checkBoxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 10,
    },
    textHeader: {
        fontSize: 25,
        fontWeight: '600',
        color: '#34ebd8',
        textTransform: 'uppercase'
    }
    
});

export  default NamingSchemeScreen;