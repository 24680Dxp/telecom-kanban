import { useState } from 'react'
import { Modal, Upload, Button, message, Table } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { uploadAccessPoints } from '../../api'

export default function ImportModal({ projectId, open, onClose, onSuccess }) {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)

  const handleUpload = async () => {
    if (!file) {
      message.warning('请选择文件')
      return
    }
    setUploading(true)
    try {
      const res = await uploadAccessPoints(projectId, file)
      setResult(res)
      if (res.imported > 0) message.success(`成功导入 ${res.imported} 条`)
      if (res.skipped > 0) message.warning(`跳过 ${res.skipped} 条`)
      onSuccess()
    } catch (e) {
      message.error('导入失败')
    }
    setUploading(false)
  }

  const handleClose = () => {
    setFile(null)
    setResult(null)
    onClose()
  }

  return (
    <Modal
      title="导入接入点"
      open={open}
      onOk={handleUpload}
      onCancel={handleClose}
      confirmLoading={uploading}
      okText="开始导入"
      width={600}
    >
      <Upload
        beforeUpload={(f) => { setFile(f); return false }}
        accept=".xlsx,.xls"
        maxCount={1}
        fileList={file ? [file] : []}
        onRemove={() => setFile(null)}
      >
        <Button icon={<UploadOutlined />}>选择 Excel 文件</Button>
      </Upload>

      <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
        Excel 第一行为表头，需包含"名称"和"地址"列。同名接入点自动跳过。
      </div>

      {result && (
        <div style={{ marginTop: 16 }}>
          <div>导入 {result.imported} 条，跳过 {result.skipped} 条</div>
          {result.skipped_details?.length > 0 && (
            <div style={{ marginTop: 8, maxHeight: 200, overflow: 'auto', fontSize: 12, color: '#ff4d4f' }}>
              {result.skipped_details.map((d, i) => <div key={i}>{d}</div>)}
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}
