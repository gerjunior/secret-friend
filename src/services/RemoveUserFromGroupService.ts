import groupSchema, { IGroup } from '../models/Groups';
import usersSchema from '../models/Users';

import AppError from '../errors/AppError';

class RemoveUserFromGroupService {
  public async execute(
    group_id: string,
    user_nickname: string,
  ): Promise<IGroup> {
    const group = await groupSchema.findById(group_id);

    if (!group) {
      throw new AppError('Group not found.', 404);
    }

    const isMember = group.members.some(
      member => member.nickname === user_nickname,
    );

    if (!isMember) {
      throw new AppError('User not member of this group.', 400);
    }

    const updatedGroup = await groupSchema.findByIdAndUpdate(
      group_id,
      {
        $pull: {
          members: {
            nickname: user_nickname,
          },
        },
      },
      { new: true },
    );

    if (!updatedGroup) {
      throw new AppError(
        'An unexpected error happened while trying to remove a user from the group. Please try again later.',
        400,
      );
    }

    await usersSchema.findOneAndUpdate(
      { nickname: user_nickname },
      { $pull: { groups: { id: group.id } } },
    );

    return updatedGroup;
  }
}

export default RemoveUserFromGroupService;
