import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ConfigProvider } from './stores/configStore'
import { CopilotProvider } from './stores/copilotStore'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <CopilotProvider>
            <ConfigProvider>
                <App />
            </ConfigProvider>
        </CopilotProvider>
    </React.StrictMode>,
)
