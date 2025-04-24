import { Form, Input, Button, DatePicker, InputNumber, Select, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { FormInstance } from 'antd/es/form';
import type { UploadFile } from 'antd/es/upload/interface';
import { useTranslation } from 'react-i18next';
import dayjs, { Dayjs } from 'dayjs';
import '../styles/EventForm.css'; // Create this file next

const { TextArea } = Input;
const { Option } = Select;

interface EventFormProps {
  form: FormInstance;
  onFinish: (values: any) => void;
  initialValues?: any;
  submitLoading: boolean;
}

const EventForm = ({ form, onFinish, initialValues, submitLoading }: EventFormProps) => {
  const { t } = useTranslation();

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  // Disable past dates for DatePicker using Dayjs
  const disabledDate = (current: Dayjs) => {
    // Can not select days before today
    return current && current < dayjs().startOf('day'); // Use dayjs here
  };

  // Set initial values properly, especially for dates and file lists
  const processInitialValues = (values: any) => {
    if (!values) return {};
    const processed = { ...values };
    // Convert date strings/moment objects to Dayjs objects for DatePicker
    if (processed.date) {
      // processed.date = moment(processed.date); // Use dayjs
      processed.date = dayjs(processed.date);
    }
    if (processed.registration_deadline) {
      // processed.registration_deadline = moment(processed.registration_deadline); // Use dayjs
      processed.registration_deadline = dayjs(processed.registration_deadline);
    }
    // If there's an existing image URL, format it for the Upload component
    if (processed.image && typeof processed.image === 'string') {
        processed.image = [
          {
            uid: '-1',
            name: 'image.png', // Placeholder name
            status: 'done',
            url: processed.image, // The existing image URL
          } as UploadFile,
        ];
    } else {
        processed.image = []; // Ensure it's an empty array if no image
    }
    return processed;
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={processInitialValues(initialValues)}
    >
      <Form.Item
        name="title"
        label={t('event_title')}
        rules={[{ required: true, message: t('error_event_title_required') }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="description"
        label={t('description')}
        rules={[{ required: true, message: t('error_event_desc_required') }]}
      >
        <TextArea rows={4} />
      </Form.Item>

      <Form.Item
        name="date"
        label={t('date_time')}
        rules={[{ required: true, message: t('error_event_date_required') }]}
      >
        <DatePicker showTime disabledDate={disabledDate} format="YYYY-MM-DD HH:mm:ss" style={{ width: '100%' }}/>
      </Form.Item>

      <Form.Item
        name="location"
        label={t('location')}
        rules={[{ required: true, message: t('error_event_location_required') }]}
      >
        <Input />
      </Form.Item>
      
      <Form.Item
        name="registration_deadline"
        label={t('registration_deadline')}
      >
        <DatePicker showTime disabledDate={disabledDate} format="YYYY-MM-DD HH:mm:ss" style={{ width: '100%' }}/>
      </Form.Item>

      <Form.Item
        name="capacity"
        label={t('capacity')}
      >
        <InputNumber min={1} style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item
        name="organizer_info"
        label={t('organizer_info')}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="status"
        label={t('status')}
        rules={[{ required: true, message: t('error_event_status_required') }]}
      >
        <Select placeholder={t('select_status')}>
          <Option value="draft">{t('draft')}</Option>
          <Option value="published">{t('published')}</Option>
          <Option value="cancelled">{t('cancelled')}</Option>
        </Select>
      </Form.Item>
      
      <Form.Item
        name="image"
        label={t('event_image')}
        valuePropName="fileList"
        getValueFromEvent={normFile}
        extra={t('event_image_extra')}
      >
         <Upload 
            name="image" 
            listType="picture" 
            maxCount={1} 
            beforeUpload={() => false} // Prevent auto-upload, handle in onFinish
         >
            <Button icon={<UploadOutlined />}>{t('click_to_upload')}</Button>
         </Upload>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={submitLoading}>
          {initialValues ? t('update_event') : t('create_event')}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default EventForm; 