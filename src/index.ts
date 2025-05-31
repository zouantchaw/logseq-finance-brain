import '@logseq/libs';
import { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin';

/**
 * Main entry point for the Logseq Finance Brain plugin
 */
async function main(): Promise<void> {
  console.log('Logseq Finance Brain plugin loaded!');
  
  // Show welcome message
  logseq.App.showMsg('💰 Logseq Finance Brain plugin initialized!', 'success');
  
  // Register plugin settings
  const settings: SettingSchemaDesc[] = [
    {
      key: 'currency',
      type: 'string',
      default: 'USD',
      title: 'Currency',
      description: 'Default currency for financial calculations'
    },
    {
      key: 'dateFormat',
      type: 'string',
      default: 'YYYY-MM-DD',
      title: 'Date Format',
      description: 'Date format for transactions'
    }
  ];
  
  logseq.useSettingsSchema(settings);
  
  // Register toolbar icon
  logseq.App.registerUIItem('toolbar', {
    key: 'finance-brain',
    template: `
      <a class="button" data-on-click="showFinanceDashboard" title="Finance Brain">
        <i class="ti ti-currency-dollar"></i>
      </a>
    `
  });
  
  // Register slash commands
  logseq.Editor.registerSlashCommand('Finance: Initialize', async () => {
    await initializeFinanceStructure();
  });
  
  logseq.Editor.registerSlashCommand('Finance: Import Statement', async () => {
    logseq.App.showMsg('Statement import coming soon!', 'info');
  });
  
  logseq.Editor.registerSlashCommand('expense', async () => {
    logseq.App.showMsg('Quick expense entry coming soon!', 'info');
  });
  
  // Register model handlers
  logseq.provideModel({
    showFinanceDashboard: async () => {
      const currentPage = await logseq.Editor.getCurrentPage();
      if (currentPage) {
        await logseq.Editor.openInRightSidebar('[[Finance/Dashboard]]');
      }
    }
  });
}

/**
 * Initialize the finance page structure
 */
async function initializeFinanceStructure(): Promise<void> {
  try {
    logseq.App.showMsg('Initializing Finance structure...', 'info');
    
    // Create main Finance page
    const financePage = await logseq.Editor.createPage('Finance', {
      redirect: false
    });
    
    if (!financePage) {
      throw new Error('Failed to create Finance page');
    }
    
    // Add initial content to Finance page
    await logseq.Editor.insertBlock(financePage.uuid, '# 💰 Finance Brain', {
      isPageBlock: true
    });
    
    await logseq.Editor.insertBlock(financePage.uuid, 
      'Your personal finance management system powered by Logseq'
    );
    
    // Create sub-pages
    const subPages = [
      { name: 'Finance/Dashboard', content: '# 📊 Finance Dashboard\n\nYour financial overview will appear here.' },
      { name: 'Finance/Accounts', content: '# 🏦 Accounts\n\nManage your financial accounts here.' },
      { name: 'Finance/Investments', content: '# 📈 Investments\n\nTrack your investment portfolio here.' },
      { name: 'Finance/Statements', content: '# 📄 Statements\n\nImported statements will be organized here.' }
    ];
    
    for (const pageInfo of subPages) {
      const page = await logseq.Editor.createPage(pageInfo.name, {
        redirect: false
      });
      
      if (page) {
        const blocks = await logseq.Editor.getPageBlocksTree(page.uuid);
        if (blocks && blocks.length > 0) {
          await logseq.Editor.updateBlock(blocks[0].uuid, pageInfo.content);
        }
      }
    }
    
    logseq.App.showMsg('✅ Finance structure initialized successfully!', 'success');
    
    // Navigate to the dashboard
    await logseq.Editor.openInRightSidebar('[[Finance/Dashboard]]');
    
  } catch (error) {
    console.error('Error initializing finance structure:', error);
    logseq.App.showMsg('❌ Failed to initialize Finance structure', 'error');
  }
}

// Bootstrap the plugin
logseq.ready(main).catch(console.error); 