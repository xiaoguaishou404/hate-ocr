import { useState } from 'react'
import './App.css'

function App() {
  const [inputNumber, setInputNumber] = useState('')
  const [mahjongResult, setMahjongResult] = useState('')
  const [copySuccess, setCopySuccess] = useState(false)
  const [aiCopywriting, setAiCopywriting] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [copyCopywritingSuccess, setCopyCopywritingSuccess] = useState(false)

  // 数字到麻将emoji的映射
  const numberToMahjong: { [key: string]: string } = {
    '0': '🀆',
    '1': '🀐',
    '2': '🀑',
    '3': '🀒',
    '4': '🀓',
    '5': '🀔',
    '6': '🀕',
    '7': '🀖',
    '8': '🀗',
    '9': '🀘'
  }

  // 转换数字为麻将emoji
  const convertToMahjong = (input: string) => {
    return input
      .split('')
      .map(digit => numberToMahjong[digit] || '')
      .join('')
  }

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '') // 只保留数字
    setInputNumber(value)
    setMahjongResult(convertToMahjong(value))
  }

  // 清空输入
  const clearInput = () => {
    setInputNumber('')
    setMahjongResult('')
    setAiCopywriting('')
  }

  // 复制麻将结果到剪贴板
  const copyToClipboard = async () => {
    if (!mahjongResult) return
    
    try {
      await navigator.clipboard.writeText(mahjongResult)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000) // 2秒后重置状态
    } catch (err) {
      console.error('复制失败:', err)
      // 降级方案：选择文本
      const textArea = document.createElement('textarea')
      textArea.value = mahjongResult
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
      } catch (fallbackErr) {
        console.error('降级复制也失败:', fallbackErr)
      }
      document.body.removeChild(textArea)
    }
  }

  // AI接口调用函数
  const fetchAIResponse = async (message: string) => {
    try {
      const response = await fetch("https://ainode.ccxzhi.com/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });
      
      if (!response.ok) {
        throw new Error(`AI接口请求失败: ${response.status} ${response.statusText}`)
      }
      
      return await response.json();
    } catch (error) {
      console.error('AI接口调用错误:', error)
      throw error
    }
  }

  // 生成AI文案
  const generateAiCopywriting = async () => {
    if (!inputNumber) {
      alert('请先输入手机号码')
      return
    }
    
    // 验证手机号格式（基本验证）
    if (inputNumber.length < 8) {
      alert('请输入有效的手机号码（至少8位数字）')
      return
    }
    
    setIsGenerating(true)
    
    try {
      // 构建AI提示词，要求生成隐藏手机号的创意文案
      const prompt = `请为手机号码"${inputNumber}"创作一段有趣的文案，要求：
1. 将手机号的每一位数字巧妙地隐藏在一个生动的故事或场景中
2. 文案要自然流畅，不露痕迹地包含所有数字
3. 可以是日常生活场景、诗意描述或有趣的小故事
4. 字数控制在100字以内
5. 风格要轻松有趣，富有想象力

示例格式：昨晚走过1座小桥，看见天上有55颗星...（将${inputNumber}的每位数字融入故事中）

请直接返回创作的文案内容，不要包含其他说明文字。`

      // 调用AI接口
      const aiResponse = await fetchAIResponse(prompt)
      
      // 处理AI响应
      let generatedText = ''
      if (aiResponse && typeof aiResponse === 'object') {
        // 根据你的AI接口返回格式调整这里的数据提取逻辑
        generatedText = aiResponse.reply || aiResponse.response || aiResponse.content || aiResponse.message || aiResponse.text || ''
      } else if (typeof aiResponse === 'string') {
        generatedText = aiResponse
      }
      
      if (!generatedText.trim()) {
        throw new Error('AI返回了空的响应')
      }
      
      setAiCopywriting(generatedText.trim())
      
    } catch (error) {
      console.error('生成文案失败:', error)
      
      // 显示更详细的错误信息
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      alert(`生成文案失败: ${errorMessage}`)
      
      // 提供降级方案：使用本地模板生成
      const fallbackCopywriting = generateFallbackCopywriting(inputNumber)
      setAiCopywriting(`[离线模式] ${fallbackCopywriting}`)
      
    } finally {
      setIsGenerating(false)
    }
  }

  // 降级方案：本地模板生成文案
  const generateFallbackCopywriting = (phoneNumber: string) => {
    const templates = [
      `昨晚走过 {0} 座小桥，看见天上有 {1}{2} 颗星，许愿的时候掉下 {3} 颗流星，刚好有 {4} 个小孩欢呼，可惜路边 {5} 个行人，后来来了 {6} 辆车，等了 {7} 会儿，一起开往 {8}{9}{10} 国道。`,
      `今天收到 {0} 束花，房间里有 {1}{2} 本书，桌上放着 {3} 个苹果，窗外飞过 {4} 只鸟，楼下停了 {5} 辆自行车，邻居家养了 {6} 只猫，下午 {7} 点时，在第 {8}{9}{10} 号咖啡厅相遇。`,
      `梦里爬了 {0} 座山，遇到 {1}{2} 朵云，采了 {3} 颗露珠，听见 {4} 声鸟鸣，看到 {5} 条小溪，经过 {6} 片森林，休息 {7} 分钟后，走向 {8}{9}{10} 号小屋。`
    ]
    
    const randomTemplate = templates[Math.floor(Math.random() * templates.length)]
    let result = randomTemplate
    
    // 将手机号的每一位数字填入模板
    for (let i = 0; i < phoneNumber.length && i < 11; i++) {
      result = result.replace(`{${i}}`, phoneNumber[i] || '0')
    }
    
    // 处理剩余的占位符
    for (let i = phoneNumber.length; i < 11; i++) {
      result = result.replace(`{${i}}`, Math.floor(Math.random() * 10).toString())
    }
    
    return result
  }

  // 复制AI文案到剪贴板
  const copyCopywritingToClipboard = async () => {
    if (!aiCopywriting) return
    
    try {
      await navigator.clipboard.writeText(aiCopywriting)
      setCopyCopywritingSuccess(true)
      setTimeout(() => setCopyCopywritingSuccess(false), 2000)
    } catch (err) {
      console.error('复制失败:', err)
      // 降级方案：选择文本
      const textArea = document.createElement('textarea')
      textArea.value = aiCopywriting
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        setCopyCopywritingSuccess(true)
        setTimeout(() => setCopyCopywritingSuccess(false), 2000)
      } catch (fallbackErr) {
        console.error('降级复制也失败:', fallbackErr)
      }
      document.body.removeChild(textArea)
    }
  }

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <div className="logo-section">
            <img src="/logo.png" alt="讨厌OCR Logo" className="logo" />
            <div className="brand-info">
              <h1 className="title">讨厌OCR</h1>
            </div>
          </div>
          <div className="intro-section">
            <p className="subtitle">
              绕过社交平台限制，用麻将 🀄 emoji 🀄 优雅分享手机号！
              <br />
              支持麻将表情转换 + AI智能文案生成，让分享联系方式更有趣更安全
            </p>
          </div>
        </header>
        
        <div className="input-section">
          <input
            type="text"
            value={inputNumber}
            onChange={handleInputChange}
            placeholder="请输入手机号码（例如：13800138000）"
            className="number-input"
            maxLength={11}
          />
          <button onClick={clearInput} className="clear-btn">
            清空
          </button>
        </div>

        <div className="result-section">
          <div className="result-label">麻将表示：</div>
          <div className="mahjong-result">
            {mahjongResult || '等待输入数字...'}
          </div>
          {mahjongResult && (
            <button onClick={copyToClipboard} className="copy-btn">
              {copySuccess ? (
                <>
                  <span className="copy-icon">✅</span>
                  已复制！
                </>
              ) : (
                <>
                  <span className="copy-icon">📋</span>
                  复制结果
                </>
              )}
            </button>
          )}
        </div>

        <div className="ai-section">
          <div className="ai-header">
            <div className="ai-label">🤖 AI生成文案</div>
            {inputNumber && (
              <button 
                onClick={generateAiCopywriting} 
                className="generate-btn"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <span className="loading-icon">⏳</span>
                    生成中...
                  </>
                ) : (
                  <>
                    <span className="ai-icon">✨</span>
                    生成文案
                  </>
                )}
              </button>
            )}
          </div>
          <div className="ai-result">
            {isGenerating ? (
              <div className="loading-text">
                <div className="loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                AI正在为您创作独特文案，请稍候...
              </div>
            ) : aiCopywriting ? (
              <div className="copywriting-text">{aiCopywriting}</div>
            ) : (
              <div className="empty-text">
                <div className="hint-icon">💡</div>
                输入手机号码后，点击"生成文案"按钮，AI将为您创作隐藏手机号的有趣文案~
                <div className="example-hint">例如：将 "13800138000" 转化为生动有趣的小故事</div>
              </div>
            )}
          </div>
          {aiCopywriting && !isGenerating && (
            <button onClick={copyCopywritingToClipboard} className="copy-copywriting-btn">
              {copyCopywritingSuccess ? (
                <>
                  <span className="copy-icon">✅</span>
                  已复制！
                </>
              ) : (
                <>
                  <span className="copy-icon">📋</span>
                  复制文案
                </>
              )}
            </button>
          )}
        </div>

        <div className="example-section">
          <h3>对照表：</h3>
          <div className="mapping-grid">
            {Object.entries(numberToMahjong).map(([number, mahjong]) => (
              <div key={number} className="mapping-item">
                <span className="number">{number}</span>
                <span className="arrow">→</span>
                <span className="mahjong">{mahjong}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
