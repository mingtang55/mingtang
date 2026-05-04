const express = require('express');
const fetch = require('node-fetch');

const app = express();

app.use(express.json());
app.use(express.static('.'));

app.post('/api/generate', async (req, res) => {
    const userDemand = req.body.demand;
    
    // 从环境变量读取 Key，本地测试时用你的 Key
    const DEEPSEEK_KEY = process.env.DEEPSEEK_KEY || 'sk-aed7aa4494704fdb979b2c808007539d';
    
    try {
        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_KEY}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    {
                        role: 'system',
                        content: '你是一位精通姓名学、精通传统文化的创意命名专家。用户会告诉你想要的名字类型。请一次性生成50个不重复、有文化感、可直接使用的名字。每个名字2-6字，不包含特殊符号，不包含英文。输出格式：一行一个名字，不要有序号，不要有任何额外文字。'
                    },
                    {
                        role: 'user',
                        content: userDemand
                    }
                ],
                temperature: 0.8,
                max_tokens: 2000
            })
        });
        
        const data = await response.json();
        
        if (data.error) {
            console.error('DeepSeek API 错误:', data.error);
            res.json({ success: false, error: data.error.message });
            return;
        }
        
        const content = data.choices[0].message.content;
        const names = content.split('\n').filter(l => l.trim().length > 0);
        
        res.json({ success: true, names: names.slice(0, 50) });
        
    } catch (error) {
        console.error('请求错误:', error);
        res.json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ 后端服务已启动: http://localhost:${PORT}`);
});