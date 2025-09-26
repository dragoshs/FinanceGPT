import React from 'react';
import { Achievement } from '../types';
import { TrophyIcon } from './icons';
import { useI18n } from '../i18n';

interface WellnessTrackerProps {
  achievements: Achievement[];
}

const WellnessTracker: React.FC<WellnessTrackerProps> = ({ achievements }) => {
  const { t } = useI18n();
  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
      {achievements.length === 0 ? (
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 py-4">
          {t('wellness.placeholder')}
        </p>
      ) : (
        <ul className="space-y-3">
          {achievements.slice(0).reverse().map((ach) => (
            <li key={ach.id} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                <TrophyIcon className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{ach.title}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300">{ach.message}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default WellnessTracker;