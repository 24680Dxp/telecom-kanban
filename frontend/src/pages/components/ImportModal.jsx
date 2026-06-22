import { useState } from 'react'
import { Modal, Upload, Button, message, Input, Segmented } from 'antd'
import { UploadOutlined, FileTextOutlined } from '@ant-design/icons'
import { uploadAccessPoints, parseTextReport } from '../../api'

export default function ImportModal({ projectId, open, onClose, onSuccess }) {
  const [mode, setMode] = useState('excel')
  const [file, setFile] = useState(null)
  const [text, setText] = useState('')
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)

  const handleUpload = async () => {
    if (mode === 'text') {
      if (!text.trim()) {
        message.warning('请粘贴进度汇报文本')
        return
      }
      setUploading(true)
      try {
        const res = await parseTextReport(projectId, text)
        setResult(res)
        if (res.imported > 0) message.success(`成功导入 ${res.imported} 条`)
        if (res.skipped > 0) message.warning(`跳过 ${res.skipped} 条`)
        onSuccess()
      } catch (e) {
        message.error('解析失败')
      }
      setUploading(false)
      return
    }

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
    setText('')
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
      width={650}
    >
      <Segmented
        options={[
          { label: 'Excel 文件', value: 'excel', icon: <UploadOutlined /> },
          { label: '粘贴文本', value: 'text', icon: <FileTextOutlined /> },
        ]}
        value={mode}
        onChange={setMode}
        block
        style={{ marginBottom: 16 }}
      />

      {mode === 'excel' ? (
        <>
          <Upload
            beforeUpload={(f) => { setFile(f); return false }}
            accept=".xlsx,.xls"
            maxCount={1}
            fileList={file ? [file] : []}
            onRemove={() => { setFile(null); setResult(null) }}
          >
            <Button icon={<UploadOutlined />}>选择 Excel 文件</Button>
          </Upload>
          <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
            Excel 第一行为表头，需包含"名称"和"地址"列。同名接入点自动跳过。
          </div>
        </>
      ) : (
        <>
          <Input.TextArea
            rows={8}
            placeholder={`粘贴进度汇报文本，格式示例：\n\n【6月22日】本批次9个接入点进度如下：\n①现场完工待工单开通（1个）：粤發电竞(江高店)。\n--②现场跳纤环节（2个）：杰米电竞、魔潮电竞(石岗店)。\n--③网络侧瓶颈（4个）：1号电竞(人和店)（中继未验收）、...`}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
            系统自动识别阶段名称和接入点，瓶颈备注会存入地址字段。
          </div>
        </>
      )}

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
