import { TbBasicUser } from '../../entities/user/basic-user.entity';
import { TbInfoUser } from '../../entities/user/info-user.entity';
import { UserInformationResponseDto } from '../../dtos/user/user.dto';

export function mapToUserInformationResponse(
  basic: TbBasicUser,
  info: TbInfoUser,
): UserInformationResponseDto {
  return {
    id: basic.id,
    userCode: basic.userCode,
    userName: info.userName,
    userDob: info.userDob,
    userGender: info.userGender,
    userPhone: basic.phone,
    userEmail: basic.email,
    userAvatar: info.avatar,
    userRole: basic.role,
    userStatus: basic.status,
    userIsEmailVerified: basic.isEmailVerified,
  };
}

export function mergeUserInformationList(
  basicUsers: TbBasicUser[],
  infoUsers: TbInfoUser[],
): UserInformationResponseDto[] {
  const basicByUserCode = new Map(
    basicUsers.map((basic) => [basic.userCode, basic]),
  );
  const infoByUserCode = new Map(
    infoUsers.map((info) => [info.userCode, info]),
  );

  return [...basicByUserCode.keys()]
    .filter((userCode) => infoByUserCode.has(userCode))
    .map((userCode) =>
      mapToUserInformationResponse(
        basicByUserCode.get(userCode)!,
        infoByUserCode.get(userCode)!,
      ),
    );
}
