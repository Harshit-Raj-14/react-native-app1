import { View, Text } from 'react-native'
import React from 'react'
import {Tabs} from 'expo-router'
import Foundation from '@expo/vector-icons/Foundation';
import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from '@expo/vector-icons/AntDesign';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{headerShown:false}}>
        
        <Tabs.Screen name='index' 
          options={{
            // tabBarLabel:'Home',
            tabBarIcon:({Colors,size})=>(
            <Foundation name="dollar" size={24} color="black" />
          ) 
          }}
        />

        <Tabs.Screen name='AddNew' 
          options={{
            // tabBarLabel:'Home',
            tabBarIcon:({Colors,size})=>(
              <AntDesign name="swap" size={size} color="black" />
          ) 
          }}
        />

        <Tabs.Screen name='Profile' 
          options={{
            // tabBarLabel:'Home',
            tabBarIcon:({Colors,size})=>(
              <Ionicons name="person-circle-sharp" size={24} color="black" />
          ) 
          }}
        />

    </Tabs>
  )
}