/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import AbstractIssue, { AbstractIssueArgs } from './abstract-issue';

type RelationshipIssueArgs = AbstractIssueArgs & { from: string; to: string; type: string };

export default class RelationshipIssue extends AbstractIssue {
  from: string;
  to: string;
  type: string;

  constructor(args: RelationshipIssueArgs) {
    super(args);
    if (!args.from || !args.to || !args.type) {
      throw new Error("A relationship's source, destination & type must be passed.");
    }
    this.from = args.from;
    this.to = args.to;
    this.type = args.type;
  }
}