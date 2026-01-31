window.MemberService = {
    async fetchMembers() {
        const { data, error } = await window.supabaseClient
            .from('members')
            .select('*')
            .order('rank', { ascending: true });
        
        if (error) throw error;
        return data || [];
    },

    async addMember(formData) {
        const { error } = await window.supabaseClient.from('members').insert([formData]);
        if (error) throw error;
    },

    async updateMember(id, formData) {
        const { error } = await window.supabaseClient.from('members').update(formData).eq('id', id);
        if (error) throw error;
    },

    async deleteMember(id) {
        const { error } = await window.supabaseClient.from('members').delete().eq('id', id);
        if (error) throw error;
    },

    async uploadMemberImage(file) {
        const fileExt = file.name.split('.').pop();
        const hash = await window.Helpers.getFileHash(file);
        const fileName = `m_${hash}.${fileExt}`;
        const filePath = `${fileName}`;

        const { data, error } = await window.supabaseClient.storage
            .from('members')
            .upload(filePath, file, { upsert: true });

        if (error) throw error;

        const { data: { publicUrl } } = window.supabaseClient.storage
            .from('members')
            .getPublicUrl(filePath);

        return publicUrl;
    }
};
