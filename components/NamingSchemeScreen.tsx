import React, {useEffect, useState} from "react";
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
import { CameraNamingScheme } from "../types/Types";
import { RootStackParamList } from "../navigations/AppNavigator";
import { useNamingScheme } from "../contexts/NamingSchemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {Picker} from '@react-native-picker/picker';

type NamingSchemeScreenRouteProp = RouteProp<RootStackParamList, 'NamingSchemeScreen'>;
const NamingSchemeScreen: React.FC<{route: NamingSchemeScreenRouteProp}> = ({route}) => {
    const [useDateTime, setUseDateTime] = useState(true);
    const [useSequence, setUseSequence] = useState(false);
    const [sequence, setSequence] = useState('');
    const [prefix, setPrefix] = useState('');
    const [sequenceError, setSequenceError] = useState("");
    const { namingScheme, setNamingScheme } = useNamingScheme();
    const [isSaveEnabled, setIsSaveEnabled] = useState(true);
    const [previousSchemes, setPreviousSchemes] = useState<CameraNamingScheme[]>([]);
    const [selectedPreviousScheme, setSelectedPreviousScheme] = useState('');
    // const [selectedPreviousScheme, setSelectedPreviousScheme] = useState<CameraNamingScheme | null>(null);
    const [showTextInput, setShowTextInput] = useState(true);
    const [isCustomPrefix, setIsCustomPrefix] = useState(true);
    const [isCustomSequence, setIsCustomSequence] = useState(true);
    // const [selectedScheme, setSelectedScheme] = useState<CameraNamingScheme | null>(null);


    const navigation = useNavigation();

    useEffect(() => {
        // Load previously selected naming schemes from AsyncStorage
        const loadPreviousSchemes = async () => {
            try {
                const schemesJson = await AsyncStorage.getItem('previousSchemes');
                if (schemesJson) {
                    const schemes = JSON.parse(schemesJson) as CameraNamingScheme[];
                    setPreviousSchemes(schemes);
                }
            } catch (error) {
                console.error('Error loading previous schemes:', error);
            }
        };

        loadPreviousSchemes();
    }, []);

    useEffect(() => {
        if (selectedPreviousScheme) {
          const selectedScheme = previousSchemes.find((scheme) => scheme.type === selectedPreviousScheme);
          if (selectedScheme) {
            setUseDateTime(selectedScheme.type === 'datetime');
            setUseSequence(selectedScheme.type === 'sequence');
      
            if ('sequence' in selectedScheme) {
              setSequence(selectedScheme.sequence);
            }
      
            if ('prefix' in selectedScheme) {
              setPrefix(selectedScheme.prefix);
            }
          }
        }
      }, [selectedPreviousScheme]);

       useEffect(() => {
        if (selectedPreviousScheme) {
            const selectedScheme = previousSchemes.find((scheme) => scheme.type === selectedPreviousScheme);
            if (selectedScheme) {
                if (selectedScheme.type === 'datetime') {
                    setUseDateTime(true);
                    setUseSequence(false);
                } else if (selectedScheme.type === 'sequence') {
                    setUseDateTime(false);
                    setUseSequence(true);
                    setSequence(selectedScheme.sequence || '');
                } else if (selectedScheme.type === 'datetime & sequence') {
                    setUseDateTime(true);
                    setUseSequence(true);
                    setSequence(selectedScheme.sequence || '');
                }
                setPrefix(selectedScheme.prefix || '');
                setShowTextInput(selectedScheme.type === 'sequence');
            }
        }
    }, [selectedPreviousScheme, previousSchemes]);
    // useEffect(() => {
    //     // Update the input fields when a previous scheme is selected
    //     if (selectedPreviousScheme) {
    //         setUseDateTime(selectedPreviousScheme.type === 'datetime');
    //         setUseSequence(selectedPreviousScheme.type === 'sequence');
    //         setSequence(selectedPreviousScheme.sequence || '');
    //         setPrefix(selectedPreviousScheme.prefix);
    //     }
    // }, [selectedPreviousScheme]);

    useEffect(() => {
        if (!useDateTime && !useSequence) {
            setIsSaveEnabled(false);
        } else {
            setIsSaveEnabled(true);
        }
    }, [useDateTime, useSequence]);

    useEffect(() => {
        if (namingScheme.type === 'datetime') {
            setUseDateTime(true);
            setUseSequence(false);
        } else if (namingScheme.type === 'sequence') {
            setUseDateTime(false);
            setUseSequence(true);
            setSequence(namingScheme.sequence || '');
        } else if (namingScheme.type === 'datetime & sequence') {
            setUseDateTime(true);
            setUseSequence(true);
            setSequence(namingScheme.sequence || '');
        }
        setPrefix(namingScheme.prefix);
    }, [namingScheme]);
    const handleSave = () => {

        if(useSequence){
            if(!sequence){
                setSequenceError('Sequence cannot be blank');
                return;
            }
            else if(!/^[0-9]+$/.test(sequence)){
                setSequenceError("Sequence can only contain numbers");
                return;
            }
        }

        // let updatedNamingScheme: CameraNamingScheme = {
        //     type: (useDateTime && useSequence) ? 'datetime & sequence' : 
        //           (useDateTime ? 'datetime' : 'sequence'),
        //     prefix,
        //     sequence
        // };

        let updatedNamingScheme: CameraNamingScheme;
        if (useDateTime && useSequence) {
            updatedNamingScheme = {
                type: 'datetime & sequence',
                prefix,
                sequence
            };
        } else if (useDateTime) {
            updatedNamingScheme = {
                type: 'datetime',
                prefix
            };
        } else if (useSequence) {
            updatedNamingScheme = {
                type: 'sequence',
                prefix,
                sequence
            };
           
        }else{
            updatedNamingScheme = {
                type: 'datetime',
                prefix,
            };
        }

        setNamingScheme(updatedNamingScheme);


        let newScheme;
    
        if (useDateTime && useSequence) {
            newScheme = {
                type: 'datetime & sequence',
                prefix,
                sequence
            };
        } else if (useDateTime) {
            newScheme = {
                type: 'datetime',
                prefix
            };
        } else if (useSequence) {
            newScheme = {
                type: 'sequence',
                prefix,
                sequence
            };
        }else {
            newScheme = {
                type: 'datetime', 
                prefix
            };
        }
        let newPrefix = prefix;
        let newSequence = sequence;

        if (!isCustomPrefix) {
            newPrefix = typeof selectedPreviousScheme === 'object' ? selectedPreviousScheme : '';
        }
          
        if (!isCustomSequence) {
            newSequence = typeof selectedPreviousScheme === 'object' ? selectedPreviousScheme : '';
        }

        // const newScheme = {
        // type: useDateTime && useSequence ? "datetime & sequence" : useDateTime ? "datetime" : "sequence",
        // prefix: newPrefix,
        // sequence: newSequence,
        // };
        
        const updatedSchemes = [...previousSchemes, newScheme];
        AsyncStorage.setItem('previousSchemes', JSON.stringify(updatedSchemes))
        .then(() => {
            console.log('Previous schemes updated in AsyncStorage');
        })
        .catch((error) => {
            console.error('Error updating previous schemes:', error);
        });

        navigation.goBack();
        setPrefix('');
        setSequence('');
        ToastAndroid.showWithGravity('Naming Scheme has been updated ', ToastAndroid.SHORT, ToastAndroid.CENTER)

       
    };

    const clearPreviousSchemes = async () => {
        try {
          await AsyncStorage.removeItem('previousSchemes');
          setPreviousSchemes([]);
          ToastAndroid.showWithGravity('Previous schemes cleared', ToastAndroid.SHORT, ToastAndroid.CENTER);
        } catch (error) {
          console.error('Error clearing previous schemes:', error);
        }
    };
    const handlePickerValueChange = (itemValue: React.SetStateAction<string>) => {
        setSelectedPreviousScheme(itemValue);
        const selectedScheme = previousSchemes.find((scheme) => scheme.type === itemValue);
        if (selectedScheme) {
            if (selectedScheme.type === 'datetime') {
              setUseDateTime(true);
              setUseSequence(false);
              setPrefix(selectedScheme.prefix);
              setSequence('');
            } else if (selectedScheme.type === 'sequence') {
              setUseDateTime(false);
              setUseSequence(true);
              setPrefix(selectedScheme.prefix);
              setSequence(selectedScheme.sequence || '');
            } else if (selectedScheme.type === 'datetime & sequence') {
              setUseDateTime(true);
              setUseSequence(true);
              setPrefix(selectedScheme.prefix);
              setSequence(selectedScheme.sequence || '');
            }
            setShowTextInput(selectedScheme.type === 'sequence');
        }
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
            <TextInput
                style={styles.input}
                placeholder="Enter Prefix"
                value={prefix}
                onChangeText={setPrefix}
            />
            {useSequence && (
                <View>
                    <TextInput
                    style={[styles.input, useSequence && sequenceError ? styles.inputError : null]}
                    placeholder="Enter Sequence"
                    value={sequence}
                    onChangeText={(newSequence) => {
                        setSequence(newSequence);
                        setSequenceError(""); // Clear the error when the user starts typing
                    }}/>
                    {sequenceError ? <Text style={styles.errorText}>{sequenceError}</Text> : null}
                </View> 
            )}
            <Picker
                selectedValue={selectedPreviousScheme}
                onValueChange= {handlePickerValueChange}>
                    <Picker.Item label="Select from previous naming schemes" value="" />
                    {previousSchemes.map((scheme) => (
                        <Picker.Item key={scheme.type} label={scheme.prefix} value={scheme.prefix} />
                    ))}
            </Picker>

            <TouchableOpacity 
                style = {[styles.saveButton, {backgroundColor: isSaveEnabled ? 'blue' : 'grey'}]} 
                onPress={handleSave} 
                disabled = {!isSaveEnabled}>
                <Text style = {{color: 'white'}}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity style={{marginTop: '3%'}} onPress={clearPreviousSchemes}>
                <Text>Clear Previous Schemes</Text>
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
    },
    inputError: {
        borderColor: "red",
    },

    errorText: {
        color: "red",
        marginBottom: 8,
    },
    
});

export  default NamingSchemeScreen;



















// onValueChange={(itemValue) => {
                //     setSelectedPreviousScheme(itemValue);
                //     const selectedScheme = previousSchemes.find((scheme) => scheme.type === itemValue);
                //     if (selectedScheme) {
                //         if (selectedScheme.type === 'datetime') {
                //             setUseDateTime(true);
                //             setUseSequence(false);
                //         } else if (selectedScheme.type === 'sequence') {
                //             setUseDateTime(false);
                //             setUseSequence(true);
                //             setSequence(selectedScheme.sequence || '');
                //         } else if (selectedScheme.type === 'datetime & sequence') {
                //             setUseDateTime(true);
                //             setUseSequence(true);
                //             setSequence(selectedScheme.sequence || '');
                //         }
                //         setPrefix(selectedScheme.prefix);
                //         setShowTextInput(selectedScheme.type === 'sequence');
                //     }
                // }}







{/* <CheckBox
                value={isCustomPrefix}
                onValueChange={() => {
                setIsCustomPrefix(!isCustomPrefix);
            }}
            />
            <TextInput
                style={styles.input}
                placeholder="Enter Prefix"
                value={isCustomPrefix ? prefix : selectedPreviousScheme}
                onChangeText={(text) => {
                setPrefix(text);
                }}
                editable={isCustomPrefix}
            />
            <CheckBox
                value={isCustomSequence}
                onValueChange={() => {
                setIsCustomSequence(!isCustomSequence);
                }}
            />
            <TextInput
                style={[styles.input, useSequence && sequenceError ? styles.inputError : null]}
                placeholder="Enter Sequence"
                value={isCustomSequence ? sequence : selectedPreviousScheme}
                onChangeText={(text) => {
                setSequence(text);
                setSequenceError("");
                }}
                editable={isCustomSequence}
            /> */}