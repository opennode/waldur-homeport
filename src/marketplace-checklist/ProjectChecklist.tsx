import * as React from 'react';
import * as Button from 'react-bootstrap/lib/Button';
import { useSelector } from 'react-redux';
import Select from 'react-select';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { $state } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { connectAngularComponent } from '@waldur/store/connect';
import { getProject } from '@waldur/workspace/selectors';

import { AnswersSummary } from './AnswersSummary';
import { AnswersTable } from './AnswersTable';
import { useProjectChecklist } from './useChecklist';

const SubmitButton = ({ submitting, submit }) => (
  <Button onClick={() => submit()} bsStyle="primary" disabled={submitting}>
    {submitting && (
      <>
        <i className="fa fa-spinner fa-spin" />{' '}
      </>
    )}
    {translate('Submit')}
  </Button>
);

const ProjectChecklist = () => {
  const project = useSelector(getProject);
  if (!project) {
    return null;
  }

  const state = useProjectChecklist(project, $state.params.category);

  if (state.checklistLoading) {
    return <LoadingSpinner />;
  } else if (state.checklistErred) {
    return <>{translate('Unable to load checklists.')}</>;
  } else if (state.checklistOptions) {
    if (!state.checklist) {
      return <>{translate('There are no checklist yet.')}</>;
    }
    return (
      <>
        <Select
          labelKey="name"
          valueKey="uuid"
          value={state.checklist}
          onChange={state.setChecklist}
          options={state.checklistOptions}
          clearable={false}
        />
        {state.questionsLoading ? (
          <LoadingSpinner />
        ) : state.questionsErred ? (
          <>{translate('Unable to load questions and answers.')}</>
        ) : (
          <>
            <AnswersSummary answers={state.answers} />
            <AnswersTable
              questions={state.questionsList}
              answers={state.answers}
              setAnswers={state.setAnswers}
            />
            <p>
              <SubmitButton
                submit={state.submit}
                submitting={state.submitting}
              />
            </p>
          </>
        )}
      </>
    );
  } else {
    return null;
  }
};

export default connectAngularComponent(ProjectChecklist);
