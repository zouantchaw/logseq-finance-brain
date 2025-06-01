import "@logseq/libs";
import { SettingSchemaDesc } from "@logseq/libs/dist/LSPlugin";

/**
 * Main entry point for the Logseq Finance Brain plugin
 */
async function main(): Promise<void> {
  console.log("Logseq Finance Brain plugin loaded!");

  // Show welcome message
  logseq.App.showMsg("💰 Logseq Finance Brain plugin initialized!", "success");

  // Register plugin settings
  const settings: SettingSchemaDesc[] = [
    {
      key: "currency",
      type: "string",
      default: "USD",
      title: "Currency",
      description: "Default currency for financial calculations",
    },
    {
      key: "dateFormat",
      type: "string",
      default: "YYYY-MM-DD",
      title: "Date Format",
      description: "Date format for transactions",
    },
  ];

  logseq.useSettingsSchema(settings);

  // Register toolbar icon
  logseq.App.registerUIItem("toolbar", {
    key: "finance-brain",
    template: `
      <a class="button" data-on-click="showFinanceDashboard" title="Finance Brain">
        <i class="ti ti-currency-dollar"></i>
      </a>
    `,
  });

  // Register slash commands
  logseq.Editor.registerSlashCommand("Finance: Initialize", async () => {
    await initializeFinanceStructure();
  });

  logseq.Editor.registerSlashCommand("Finance: Import Statement", async () => {
    logseq.App.showMsg("Statement import coming soon!", "info");
  });

  logseq.Editor.registerSlashCommand("expense", async () => {
    logseq.App.showMsg("Quick expense entry coming soon!", "info");
  });

  // Register model handlers
  logseq.provideModel({
    showFinanceDashboard: async () => {
      const dashboardPage = await logseq.Editor.getPage("Finance/Dashboard");
      if (dashboardPage && dashboardPage.uuid) {
        await logseq.Editor.openInRightSidebar(dashboardPage.uuid);
      } else {
        logseq.App.showMsg(
          "Finance Dashboard not found. Run /Finance: Initialize first",
          "warning"
        );
      }
    },
  });
}

/**
 * Initialize the finance page structure
 */
async function initializeFinanceStructure(): Promise<void> {
  try {
    logseq.App.showMsg("Initializing Finance structure...", "info");

    // Check if Finance page already exists
    let financePage = await logseq.Editor.getPage("Finance");

    if (!financePage) {
      // Create main Finance page
      financePage = await logseq.Editor.createPage("Finance", {
        redirect: false,
      });

      if (!financePage) {
        throw new Error("Failed to create Finance page");
      }

      // Add initial content to Finance page
      const firstBlock = await logseq.Editor.insertBlock(
        financePage.uuid,
        "# 💰 Finance Brain",
        {
          isPageBlock: true,
        }
      );

      if (firstBlock) {
        await logseq.Editor.insertBlock(
          firstBlock.uuid,
          "Your personal finance management system powered by Logseq"
        );
      }
    }

    // Create sub-pages
    const subPages = [
      {
        name: "Finance/Dashboard",
        content:
          "# 📊 Finance Dashboard\n\nYour financial overview will appear here.",
      },
      {
        name: "Finance/Accounts",
        content: "# 🏦 Accounts\n\nManage your financial accounts here.",
      },
      {
        name: "Finance/Investments",
        content: "# 📈 Investments\n\nTrack your investment portfolio here.",
      },
      {
        name: "Finance/Statements",
        content:
          "# 📄 Statements\n\nImported statements will be organized here.",
      },
    ];

    let dashboardPageUuid: string | undefined;
    let createdCount = 0;
    let existingCount = 0;

    for (const pageInfo of subPages) {
      // Check if page already exists
      let page = await logseq.Editor.getPage(pageInfo.name);

      if (!page) {
        // Create page if it doesn't exist
        page = await logseq.Editor.createPage(pageInfo.name, {
          redirect: false,
        });

        if (page) {
          createdCount++;
          // Insert content as first block
          await logseq.Editor.insertBlock(page.uuid, pageInfo.content, {
            isPageBlock: true,
          });
        }
      } else {
        existingCount++;
      }

      // Store dashboard UUID for later
      if (page && pageInfo.name === "Finance/Dashboard") {
        dashboardPageUuid = page.uuid;
      }
    }

    // Show appropriate message
    if (createdCount > 0) {
      logseq.App.showMsg(
        `✅ Finance structure initialized! Created ${createdCount} pages, ${existingCount} already existed.`,
        "success"
      );
    } else {
      logseq.App.showMsg("✅ Finance structure already exists!", "info");
    }

    // Navigate to the dashboard if we have its UUID
    if (dashboardPageUuid) {
      await logseq.Editor.openInRightSidebar(dashboardPageUuid);
    }
  } catch (error) {
    console.error("Error initializing finance structure:", error);
    logseq.App.showMsg("❌ Failed to initialize Finance structure", "error");
  }
}

// Bootstrap the plugin
logseq.ready(main).catch(console.error);
