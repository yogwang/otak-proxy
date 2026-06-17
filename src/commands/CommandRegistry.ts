/**
 * @file CommandRegistry
 * @description Centralized command registration and management
 *
 * Requirements:
 * - 1.1, 5.1: Commands must be registered before status bar display
 * - 2.2: Unified command registration
 * - 2.3: Error handling consistency
 */

import * as vscode from 'vscode';
import { ProxyMode, ProxyState } from '../core/types';
import { CommandContext } from './types';
import { executeToggleProxy } from './ToggleProxyCommand';
import { executeConfigureUrl } from './ConfigureUrlCommand';
import { executeTestProxy } from './TestProxyCommand';
import { executeImportProxy } from './ImportProxyCommand';
import { executeToggleShowProxyUrl } from './ToggleShowProxyUrlCommand';
import { executeToggleTarget, ProxyTargetKey } from './ToggleTargetCommand';
import type { ProxyMonitorConfig } from '../monitoring/ProxyMonitor';
import * as ConfigChange from './ConfigChangeHandlers';

/**
 * Configuration for CommandRegistry
 */
export interface CommandRegistryConfig {
    // Extension context
    context: vscode.ExtensionContext;

    // State management functions
    getProxyState: (context: vscode.ExtensionContext) => Promise<ProxyState>;
    saveProxyState: (context: vscode.ExtensionContext, state: ProxyState) => Promise<void>;
    getActiveProxyUrl: (state: ProxyState) => string;
    getNextMode: (currentMode: ProxyMode) => ProxyMode;

    // Proxy operations
    applyProxySettings: (url: string, enabled: boolean, context?: vscode.ExtensionContext) => Promise<boolean>;
    updateStatusBar: (state: ProxyState) => void;
    checkAndUpdateSystemProxy: (context: vscode.ExtensionContext) => Promise<void>;
    startSystemProxyMonitoring: (context: vscode.ExtensionContext) => Promise<void>;
    stopSystemProxyMonitoring: (context: vscode.ExtensionContext) => Promise<void>;

    // Utilities
    userNotifier: {
        showSuccess: (key: string, params?: Record<string, string>) => void;
        showWarning: (key: string, params?: Record<string, string>) => void;
        showError: (key: string, suggestions?: string[]) => void;
        showErrorWithDetails: (
            message: string,
            details: import('../errors/OutputChannelManager').ErrorDetails,
            suggestions?: string[],
            params?: Record<string, string>
        ) => Promise<void>;
        showProgressNotification: <T>(
            title: string,
            task: (progress: vscode.Progress<{ message?: string; increment?: number }>) => Promise<T>,
            cancellable?: boolean
        ) => Promise<T>;
    };
    sanitizer: {
        maskPassword: (url: string) => string;
    };

    // ProxyMonitor and SystemProxyDetector for config change handling
    proxyMonitor: {
        updateConfig: (config: Partial<ProxyMonitorConfig>) => void;
        triggerCheck: (source: 'config' | 'network' | 'polling' | 'focus') => void;
    };
    systemProxyDetector: {
        updateDetectionPriority: (priority: string[]) => void;
    };
}

/**
 * CommandRegistry handles registration of all extension commands
 */
export class CommandRegistry {
    private config: CommandRegistryConfig;
    private commandContext: CommandContext;

    constructor(config: CommandRegistryConfig) {
        this.config = config;
        this.commandContext = this.createCommandContext();
    }

    /**
     * Create command context from config
     */
    private createCommandContext(): CommandContext {
        const { context } = this.config;
        return {
            extensionContext: context,
            getProxyState: () => this.config.getProxyState(context),
            saveProxyState: (state) => this.config.saveProxyState(context, state),
            getActiveProxyUrl: this.config.getActiveProxyUrl,
            getNextMode: this.config.getNextMode,
            applyProxySettings: (url, enabled) => this.config.applyProxySettings(url, enabled, context),
            updateStatusBar: this.config.updateStatusBar,
            checkAndUpdateSystemProxy: () => this.config.checkAndUpdateSystemProxy(context),
            startSystemProxyMonitoring: () => this.config.startSystemProxyMonitoring(context),
            stopSystemProxyMonitoring: () => this.config.stopSystemProxyMonitoring(context),
            userNotifier: this.config.userNotifier,
            sanitizer: this.config.sanitizer
        };
    }

    /**
     * Register all commands
     * Requirement 1.1, 5.1: All commands must be registered before status bar display
     */
    registerAll(): void {
        const { context } = this.config;

        // Register main commands
        this.registerToggleProxy(context);
        this.registerConfigureUrl(context);
        this.registerTestProxy(context);
        this.registerImportProxy(context);
        this.registerToggleShowProxyUrl(context);
        this.registerToggleTargetCommands(context);

        // Register listeners
        this.registerConfigChangeListener(context);
        this.registerWindowFocusListener(context);
    }

    /**
     * Register toggle proxy command
     */
    private registerToggleProxy(context: vscode.ExtensionContext): void {
        const disposable = vscode.commands.registerCommand(
            'otak-proxy.toggleProxy',
            async () => executeToggleProxy(this.commandContext)
        );
        context.subscriptions.push(disposable);
    }

    /**
     * Register configure URL command
     */
    private registerConfigureUrl(context: vscode.ExtensionContext): void {
        const disposable = vscode.commands.registerCommand(
            'otak-proxy.configureUrl',
            async () => executeConfigureUrl(this.commandContext)
        );
        context.subscriptions.push(disposable);
    }

    /**
     * Register test proxy command
     */
    private registerTestProxy(context: vscode.ExtensionContext): void {
        const disposable = vscode.commands.registerCommand(
            'otak-proxy.testProxy',
            async () => executeTestProxy(this.commandContext)
        );
        context.subscriptions.push(disposable);
    }

    /**
     * Register import proxy command
     */
    private registerImportProxy(context: vscode.ExtensionContext): void {
        const disposable = vscode.commands.registerCommand(
            'otak-proxy.importProxy',
            async () => executeImportProxy(this.commandContext)
        );
        context.subscriptions.push(disposable);
    }

    /**
     * Register command to toggle proxy URL visibility in the status bar
     */
    private registerToggleShowProxyUrl(context: vscode.ExtensionContext): void {
        const disposable = vscode.commands.registerCommand(
            'otak-proxy.toggleShowProxyUrl',
            async () => executeToggleShowProxyUrl(this.commandContext)
        );
        context.subscriptions.push(disposable);
    }

    /**
     * Register commands to toggle individual proxy targets from the tooltip
     */
    private registerToggleTargetCommands(context: vscode.ExtensionContext): void {
        const targetKeys: ProxyTargetKey[] = ['vscode', 'git', 'npm', 'terminal'];
        for (const key of targetKeys) {
            const disposable = vscode.commands.registerCommand(
                `otak-proxy.toggleTarget.${key}`,
                async () => executeToggleTarget(this.commandContext, key)
            );
            context.subscriptions.push(disposable);
        }
    }

    /**
     * Register configuration change listener
     */
    private registerConfigChangeListener(context: vscode.ExtensionContext): void {
        const changeCtx: ConfigChange.ConfigChangeContext = {
            commandContext: this.commandContext,
            proxyMonitor: this.config.proxyMonitor,
            systemProxyDetector: this.config.systemProxyDetector
        };

        const disposable = vscode.workspace.onDidChangeConfiguration(async e => {
            if (e.affectsConfiguration('otakProxy.proxyUrl')) {
                await ConfigChange.handleProxyUrlChange(changeCtx);
            }
            if (e.affectsConfiguration('otakProxy.pollingInterval')) {
                ConfigChange.handlePollingIntervalChange(changeCtx);
            }
            if (e.affectsConfiguration('otakProxy.detectionSourcePriority')) {
                ConfigChange.handleDetectionPriorityChange(changeCtx);
            }
            if (e.affectsConfiguration('otakProxy.maxRetries')) {
                ConfigChange.handleMaxRetriesChange(changeCtx);
            }
            if (e.affectsConfiguration('otakProxy.showProxyUrl')) {
                await ConfigChange.handleShowProxyUrlChange(changeCtx);
            }
            if (e.affectsConfiguration('otakProxy.targets')) {
                await ConfigChange.handleTargetChange(changeCtx);
            }
        });
        context.subscriptions.push(disposable);
    }

    /**
     * Register window focus listener
     */
    private registerWindowFocusListener(context: vscode.ExtensionContext): void {
        const disposable = vscode.window.onDidChangeWindowState(async (windowState) => {
            if (windowState.focused) {
                const state = await this.commandContext.getProxyState();
                if (state.mode === ProxyMode.Auto) {
                    this.config.proxyMonitor.triggerCheck('focus');
                }
            }
        });
        context.subscriptions.push(disposable);
    }
}

/**
 * Create and register all commands
 * This is a convenience function for backward compatibility
 */
export function createCommandRegistry(config: CommandRegistryConfig): CommandRegistry {
    const registry = new CommandRegistry(config);
    registry.registerAll();
    return registry;
}
