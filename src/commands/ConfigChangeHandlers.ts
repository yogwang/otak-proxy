import * as vscode from 'vscode';
import { ProxyMode } from '../core/types';
import { Logger } from '../utils/Logger';
import { CommandContext } from './types';
import { getProxyPublicUrl, hasProxyCredentials, removeProxyCredentials } from '../utils/ProxyStateSanitizer';
import type { ProxyMonitorConfig } from '../monitoring/ProxyMonitor';

export interface ConfigChangeContext {
    commandContext: CommandContext;
    proxyMonitor: {
        updateConfig: (config: Partial<ProxyMonitorConfig>) => void;
        triggerCheck: (source: 'config' | 'network' | 'polling' | 'focus') => void;
    };
    systemProxyDetector: {
        updateDetectionPriority: (priority: string[]) => void;
    };
}

export async function handleProxyUrlChange(ctx: ConfigChangeContext): Promise<void> {
    const state = await ctx.commandContext.getProxyState();
    const newUrl = vscode.workspace.getConfiguration('otakProxy').get<string>('proxyUrl', '');
    const newPublicUrl = removeProxyCredentials(newUrl) || newUrl;
    const newComparableUrl = getProxyPublicUrl(newUrl) || newUrl;
    const currentPublicUrl = getProxyPublicUrl(state.manualProxyUrl) || state.manualProxyUrl || '';

    if (newComparableUrl !== currentPublicUrl || (newUrl && hasProxyCredentials(newUrl))) {
        state.manualProxyUrl = newUrl;
        await ctx.commandContext.saveProxyState(state);

        if (newUrl !== newPublicUrl) {
            await vscode.workspace.getConfiguration('otakProxy').update(
                'proxyUrl',
                newPublicUrl,
                vscode.ConfigurationTarget.Global
            );
        }

        if (state.mode === ProxyMode.Manual) {
            await ctx.commandContext.applyProxySettings(newUrl, !!newUrl);
            ctx.commandContext.updateStatusBar(state);
        }
    }
}

export function handlePollingIntervalChange(ctx: ConfigChangeContext): void {
    const newInterval = vscode.workspace
        .getConfiguration('otakProxy')
        .get<number>('pollingInterval', 30);
    ctx.proxyMonitor.updateConfig({
        pollingInterval: newInterval * 1000
    });
    Logger.info(`Polling interval updated to ${newInterval} seconds`);
}

export function handleDetectionPriorityChange(ctx: ConfigChangeContext): void {
    const newPriority = vscode.workspace
        .getConfiguration('otakProxy')
        .get<string[]>('detectionSourcePriority', ['environment', 'vscode', 'platform']);
    ctx.systemProxyDetector.updateDetectionPriority(newPriority);
    ctx.proxyMonitor.updateConfig({
        detectionSourcePriority: newPriority
    });
    Logger.info(`Detection source priority updated to: ${newPriority.join(', ')}`);
}

export function handleMaxRetriesChange(ctx: ConfigChangeContext): void {
    const newMaxRetries = vscode.workspace
        .getConfiguration('otakProxy')
        .get<number>('maxRetries', 3);
    ctx.proxyMonitor.updateConfig({
        maxRetries: newMaxRetries
    });
    Logger.info(`Max retries updated to ${newMaxRetries}`);
}

export async function handleShowProxyUrlChange(ctx: ConfigChangeContext): Promise<void> {
    const state = await ctx.commandContext.getProxyState();
    ctx.commandContext.updateStatusBar(state);
}

export async function handleTargetChange(ctx: ConfigChangeContext): Promise<void> {
    const state = await ctx.commandContext.getProxyState();
    if (state.mode === ProxyMode.Off) {
        ctx.commandContext.updateStatusBar(state);
        return;
    }
    const activeUrl = ctx.commandContext.getActiveProxyUrl(state);
    if (activeUrl) {
        await ctx.commandContext.applyProxySettings(activeUrl, true);
    }
    ctx.commandContext.updateStatusBar(state);
}
