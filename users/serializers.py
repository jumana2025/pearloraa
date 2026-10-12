from django.contrib.auth.models import User

from rest_framework import serializers

from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import Profile


# ============================================================
# REGISTER SERIALIZER
# ============================================================

class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True,
        min_length=6
    )

    confirm_password = serializers.CharField(
        write_only=True
    )

    phone = serializers.CharField(
        write_only=True,
        required=True
    )

    class Meta:
        model = User

        fields = [
            "first_name",
            "last_name",
            "username",
            "email",
            "phone",
            "password",
            "confirm_password",
        ]

    def validate_email(self, value):

        if User.objects.filter(
            email__iexact=value
        ).exists():

            raise serializers.ValidationError(
                "Email is already registered."
            )

        return value

    def validate(self, attrs):

        if attrs["password"] != attrs["confirm_password"]:

            raise serializers.ValidationError({
                "confirm_password":
                    "Passwords do not match."
            })

        return attrs

    def create(self, validated_data):

        # Remove confirm password
        validated_data.pop(
            "confirm_password"
        )

        # Get phone
        phone = validated_data.pop(
            "phone"
        )

        # Get password
        password = validated_data.pop(
            "password"
        )

        # Create User
        user = User.objects.create_user(
            password=password,
            **validated_data
        )

        # Update Profile
        profile = user.profile

        profile.phone = phone

        profile.save()

        return user


# ============================================================
# PROFILE SERIALIZER
# ============================================================

class ProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = Profile

        fields = [
            "phone",
            "profile_image",
        ]


# ============================================================
# USER PROFILE SERIALIZER
# ============================================================

class UserProfileSerializer(serializers.ModelSerializer):

    profile = ProfileSerializer()

    class Meta:
        model = User

        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "profile",
        ]


# ============================================================
# LOGIN SERIALIZER
# Email OR Phone + Password
# ============================================================

class LoginSerializer(serializers.Serializer):

    login = serializers.CharField()

    password = serializers.CharField(
        write_only=True
    )

    def validate(self, attrs):

        login = attrs["login"].strip()

        password = attrs["password"]

        user = None

        # ----------------------------------------------------
        # 1. Try Email
        # ----------------------------------------------------

        user = User.objects.filter(
            email__iexact=login
        ).first()

        # ----------------------------------------------------
        # 2. If email not found, try Phone
        # ----------------------------------------------------

        if not user:

            profile = Profile.objects.filter(
                phone=login
            ).select_related(
                "user"
            ).first()

            if profile:
                user = profile.user

        # ----------------------------------------------------
        # 3. User not found
        # ----------------------------------------------------

        if not user:

            raise serializers.ValidationError(
                "Invalid email/phone number or password."
            )

        # ----------------------------------------------------
        # 4. Check Password
        # ----------------------------------------------------

        if not user.check_password(password):

            raise serializers.ValidationError(
                "Invalid email/phone number or password."
            )

        # ----------------------------------------------------
        # 5. Check Active Account
        # ----------------------------------------------------

        if not user.is_active:

            raise serializers.ValidationError(
                "This account is inactive."
            )

        # ----------------------------------------------------
        # 6. Create JWT Tokens
        # ----------------------------------------------------

        refresh = RefreshToken.for_user(user)

        access = refresh.access_token

        # ----------------------------------------------------
        # 7. Return Login Data
        # ----------------------------------------------------

        profile, _ = Profile.objects.get_or_create(user=user)

        return {
            "refresh": str(refresh),

            "access": str(access),

            "user": {
                "id": user.id,
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "phone": profile.phone,
            },
        }

class AdminLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        username = attrs.get("username")
        password = attrs.get("password")

        user = authenticate(
            username=username,
            password=password
        )

        if user is None:
            raise serializers.ValidationError(
                "Invalid username or password."
            )

        if not user.is_staff:
            raise serializers.ValidationError(
                "You do not have admin access."
            )

        attrs["user"] = user
        return attrs

class AdminCustomerSerializer(serializers.ModelSerializer):
    phone = serializers.SerializerMethodField()

    def get_phone(self, obj):
        return obj.profile.phone if hasattr(obj, 'profile') else None
    profile_image = serializers.SerializerMethodField()

    def get_profile_image(self, obj):
        if hasattr(obj, 'profile') and obj.profile.profile_image:
            return obj.profile.profile_image.url
        return None

    class Meta:
        model = User
        fields = [
            'id', 'first_name', 'last_name', 'username', 'email',
            'phone', 'date_joined', 'is_active', 'profile_image'
        ]

