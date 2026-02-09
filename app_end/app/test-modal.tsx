import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '@/components/ui';
import { Modal } from '@/components/ui/Modal';
import { GrowthRecordModal } from '@/components/home/GrowthRecordModal';
import { AppointmentModal } from '@/components/home/AppointmentModal';
import { theme } from '@/constants/theme';

export default function TestModalScreen() {
  const [showSimpleModal, setShowSimpleModal] = useState(false);
  const [showGrowthModal, setShowGrowthModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Modal测试页面</Text>
      
      <Button 
        title="测试简单Modal" 
        onPress={() => {
          console.log('点击了简单Modal按钮');
          setShowSimpleModal(true);
        }} 
      />
      
      <Button 
        title="测试成长记录Modal" 
        onPress={() => {
          console.log('点击了成长记录Modal按钮');
          setShowGrowthModal(true);
        }} 
      />
      
      <Button 
        title="测试预约Modal" 
        onPress={() => {
          console.log('点击了预约Modal按钮');
          setShowAppointmentModal(true);
        }} 
      />

      <Text style={styles.status}>
        简单Modal: {showSimpleModal ? '显示' : '隐藏'}
      </Text>
      <Text style={styles.status}>
        成长记录Modal: {showGrowthModal ? '显示' : '隐藏'}
      </Text>
      <Text style={styles.status}>
        预约Modal: {showAppointmentModal ? '显示' : '隐藏'}
      </Text>

      <Modal
        visible={showSimpleModal}
        onClose={() => setShowSimpleModal(false)}
        title="简单测试"
        height="auto"
      >
        <View style={styles.modalContent}>
          <Text>这是一个简单的测试Modal</Text>
          <Button title="关闭" onPress={() => setShowSimpleModal(false)} />
        </View>
      </Modal>

      <GrowthRecordModal
        visible={showGrowthModal}
        onClose={() => setShowGrowthModal(false)}
        onSubmit={async (data) => {
          console.log('提交成长记录:', data);
          setShowGrowthModal(false);
        }}
      />

      <AppointmentModal
        visible={showAppointmentModal}
        onClose={() => setShowAppointmentModal(false)}
        onSubmit={async (data) => {
          console.log('提交预约:', data);
          setShowAppointmentModal(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    gap: 15,
    backgroundColor: theme.colors.bgBody,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  status: {
    fontSize: 14,
    color: theme.colors.textSub,
  },
  modalContent: {
    padding: 20,
    gap: 15,
  },
});
