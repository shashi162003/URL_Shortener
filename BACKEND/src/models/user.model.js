import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
        required: false,
        //use dicebear api to generate avatar
        default: function () {
            return `https://api.dicebear.com/7.x/initials/svg?seed=${this.name}`;
        }
    }
}, {
    timestamps: true
});

const User = mongoose.model("User", userSchema);
export default User;