import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator, TransitionSpecs, CardStyleInterpolators } from '@react-navigation/stack';
import SettingsModal from '../components/SettingsModal';
import NamingSchemeScreen from '../components/NamingSchemeScreen';
import CameraScreen from '../CameraScreen';
import {CameraNamingScheme, RootStackParamList} from '../types/Types';
import Shredding from '../components/Shredding';
// import Scanner from '../components/Scanner';

const stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
    return(
        <NavigationContainer>
            <stack.Navigator initialRouteName='CameraScreen'>
                <stack.Screen name='SettingsModal' component={SettingsModal as React.FC<{}>} options={{headerShown: false}}/>
                <stack.Screen 
                    name="CameraScreen" 
                    component={CameraScreen as React.FC<{}>} 
                    options={{headerShown: false}}
                    initialParams={{
                        setNamingScheme: (scheme: CameraNamingScheme) => {
                            // logic to set naming scheme
                        }
                    }}/>

                <stack.Screen 
                    name='NamingSchemeScreen' 
                    component={NamingSchemeScreen} 
                    options={{
                        title: 'Naming Scheme',
                        // cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
                        transitionSpec: {
                            open: TransitionSpecs.FadeInFromBottomAndroidSpec,
                            close: TransitionSpecs.FadeInFromBottomAndroidSpec
                        }
                    }}/>

                <stack.Screen
                    name = 'Shredding'
                    component={Shredding}/>
                {/* <stack.Screen
                    name = 'Scanner'
                    component={Scanner}
                    options={{headerShown: true}}/> */}
            </stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;