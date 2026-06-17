import * as vscode from 'vscode';
import { Logger } from '../utils/Logger';
import { ProxyConfigTarget } from './ProxyApplierTypes';

export interface ProxyTargets {
    vscode: boolean;
    git: boolean;
    npm: boolean;
    terminal: boolean;
}

export function getProxyTargets(): ProxyTargets {
    const section = vscode.workspace.getConfiguration('otakProxy.targets');
    return {
        vscode: section.get<boolean>('vscode', true),
        git: section.get<boolean>('git', true),
        npm: section.get<boolean>('npm', true),
        terminal: section.get<boolean>('terminal', true),
    };
}

export function isTargetEnabled(name: string, targets: ProxyTargets): boolean {
    switch (name) {
        case 'VSCode configuration': return targets.vscode;
        case 'Git configuration': return targets.git;
        case 'npm configuration': return targets.npm;
        case 'Terminal environment': return targets.terminal;
        default: return true;
    }
}

export function partitionApplyTargets(allTargets: ProxyConfigTarget[], targets: ProxyTargets): {
    enabledTargets: ProxyConfigTarget[];
    disabledTargets: ProxyConfigTarget[];
} {
    const enabledTargets: ProxyConfigTarget[] = [];
    const disabledTargets: ProxyConfigTarget[] = [];

    for (const t of allTargets) {
        if (isTargetEnabled(t.name, targets)) {
            enabledTargets.push(t);
        } else {
            disabledTargets.push(t);
        }
    }

    return { enabledTargets, disabledTargets };
}

export function partitionDisableTargets(allTargets: ProxyConfigTarget[], targets: ProxyTargets): {
    enabledTargets: ProxyConfigTarget[];
} {
    const enabledTargets = allTargets.filter(t => isTargetEnabled(t.name, targets));
    return { enabledTargets };
}

export async function silentUnsetTargets(targets: ProxyConfigTarget[]): Promise<void> {
    for (const target of targets) {
        try {
            await target.manager.unsetProxy();
        } catch (error) {
            Logger.error(`Silent unset failed for ${target.name}:`, error);
        }
    }
}
