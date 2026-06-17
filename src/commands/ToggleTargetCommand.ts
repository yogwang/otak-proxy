/**
 * @file ToggleTargetCommand
 * @description Toggle individual proxy targets (vscode/git/npm/terminal)
 */

import * as vscode from 'vscode';
import { ProxyMode } from '../core/types';
import { Logger } from '../utils/Logger';
import { CommandContext, CommandResult } from './types';

export type ProxyTargetKey = 'vscode' | 'git' | 'npm' | 'terminal';

/**
 * Execute the toggle target command for a specific proxy target.
 * When a target is toggled off while proxy is active, the proxy setting
 * for that target is silently unset via the next applyProxy call.
 */
export async function executeToggleTarget(ctx: CommandContext, key: ProxyTargetKey): Promise<CommandResult> {
    try {
        const state = await ctx.getProxyState();
        if (state.mode === ProxyMode.Off) {
            return { success: true };
        }

        const section = vscode.workspace.getConfiguration('otakProxy.targets');
        const current = section.get<boolean>(key, true);
        await section.update(key, !current, vscode.ConfigurationTarget.Global);
        Logger.info(`Toggled proxy target '${key}': ${current} -> ${!current}`);

        return { success: true };
    } catch (error) {
        Logger.error(`Failed to toggle target ${key}:`, error);
        return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
}
