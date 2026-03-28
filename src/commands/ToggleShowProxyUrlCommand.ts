/**
 * @file ToggleShowProxyUrlCommand
 * @description Toggle proxy URL visibility in the status bar
 */

import * as vscode from 'vscode';
import { Logger } from '../utils/Logger';
import { CommandContext, CommandResult } from './types';

/**
 * Execute the toggle show proxy URL command
 */
export async function executeToggleShowProxyUrl(ctx: CommandContext): Promise<CommandResult> {
    try {
        const config = vscode.workspace.getConfiguration('otakProxy');
        const current = config.get<boolean>('showProxyUrl', true);
        const newValue = !current;
        Logger.info(`Toggling showProxyUrl: ${current} -> ${newValue}`);
        await config.update('showProxyUrl', newValue, vscode.ConfigurationTarget.Global);

        const state = await ctx.getProxyState();
        ctx.updateStatusBar(state);

        return { success: true };
    } catch (error) {
        Logger.error('Failed to toggle showProxyUrl:', error);
        return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
}
